import { DynamoDB, Credentials, config as awsConfig } from 'aws-sdk';
import { Agent } from 'https';
import { JournalHashesCache } from './journal-hashes-cache';
import { JournalRecord } from '../../../domain/journal-record';
import { chunk, get, mean } from 'lodash';
import { config } from '../../config/config';
import { Key } from 'aws-sdk/clients/dynamodb';
import moment = require('moment');
import { customMetric, warn, info } from '@dvsa/mes-microservice-common/application/utils/logger';

/*
* Amount of time (in milliseconds), to throttle Journal writes over.
* Slowing down the writes means using less DynamoDB write capcity units (WCU's) per second,
* reducing the amount of capacity that needs to be provisioned. If we exceed the capacity (plus burst capacity)
* then some of the writes will be refused by Dynamo (tracked as unprocessed items).
*
* Upon testing in "perf", which has 50 WCUs provisioned, 2083 journals (roughly 4500 WCUs) can be successfully written
* over 4 seconds if there are no other writes for the previous 5 minutes. Doing it quicker than that (i.e. without any
* throttling) causes WCU capacity to be exceeded.
*/
const totalSaveDuration = 4 * 1000;

/*
 * Number of seconds between poller invocations.
 */
export const pollerFrequency = 900;

export const journalHashesCache = new JournalHashesCache(pollerFrequency);
let dynamoDocumentClient: DynamoDB.DocumentClient;

/**
 * Creates the DynamoDB API client. If offline then points to the local endpoint. If online then enables HTTP keep
 * alive to improve performance, since TCP connect can take longer than the API call itself, and we are issuing
 * multiple API calls in a loop.
 *
 * Only exported to support integration testing.
 */
export const getDynamoClient = () => {
  if (!dynamoDocumentClient) {
    if (config().isOffline) {
      const localRegion = 'localhost';
      awsConfig.update({
        region: localRegion,
        credentials: new Credentials('akid', 'secret', 'session'),
      });
      dynamoDocumentClient = new DynamoDB.DocumentClient({ endpoint: 'http://localhost:8000', region: localRegion });
    } else {
      const sslAgent = new Agent({
        keepAlive: true,
        maxSockets: 50,
        rejectUnauthorized: true,
      });
      awsConfig.update({
        httpOptions: {
          agent: sslAgent,
        },
      });
      dynamoDocumentClient = new DynamoDB.DocumentClient();
    }
  }
  return dynamoDocumentClient;
};

/**
 * Saves as many of the changed journals as possible to DynamoDB. Writes in batches, at a throttled rate, and aborts if
 * about to overrun.
 *
 * @param journals The changed journals to save
 * @param startTime The date and time the Lambda function started
 */
export const saveJournals = async (journals: JournalRecord[], startTime: Date): Promise<void> => {
  // update validity of the hashes cache
  journalHashesCache.update(startTime, []);

  if (journals.length > 0) {
    info(`STARTING SAVE: ${new Date()}`);
    const tableName = config().journalDynamodbTableName;
    const maxBatchWriteRequests = 25;
    const journalWriteBatches = chunk(journals, maxBatchWriteRequests);
    const { totalUnprocessedWrites, averageRequestRuntime } =
      await submitSaveRequests(journalWriteBatches, tableName, startTime);

    info(`AVERAGE REQUEST TOOK ${averageRequestRuntime}ms`);
    info(`END SAVE: ${new Date()}, ${totalUnprocessedWrites} WRITES FAILED`);
    customMetric('JournalsNotUpdated', 'Number of Journals not updated in Dynamo', totalUnprocessedWrites);
  } else {
    info(`NO SAVE NEEDED`);
  }
};

/**
 * Saves as many of the changed journals as possible to DynamoDB. Writes in batches, at a throttled rate, and aborts if
 * about to overrun.
 * @param writeBatches The journals to write, in batches
 * @param tableName The dynamo table name
 * @param startTime The date and time the Lambda function started
 * @returns { totalUnprocessedWrites, averageRequestRuntime }
 *   Total number of writes that were rejected (due to throttling)
 *   Average amount of time (in ms) that each batch write took
 */
const submitSaveRequests = async (
  writeBatches: JournalRecord[][],
  tableName: string,
  startTime: Date,
) => {
  const ddb = getDynamoClient();
  let totalUnprocessedWrites = 0;
  let requestRuntimes: number[] = [];
  let totalConsumedCapacity = 0;
  let totalWrittenJournals = 0;

  const sleepDuration = totalSaveDuration / writeBatches.length;
  for (const writeBatch of writeBatches) {
    if (runOutOfTime(startTime, sleepDuration)) {
      // this is a good point to raise an alert
      warn('No more time left, aborting any further writes!');
      break;
    }

    const writeInput = {
      RequestItems: {
        [tableName]: writeBatch.map(journalWrapper => ({
          PutRequest: {
            Item: journalWrapper,
          },
        })),
      },
      ReturnConsumedCapacity: 'TOTAL',
    } as DynamoDB.DocumentClient.BatchWriteItemInput;

    const start = process.hrtime();
    const result = await ddb.batchWrite(writeInput).promise();
    const timeTaken = process.hrtime(start);
    totalConsumedCapacity += get(result, 'ConsumedCapacity[0].CapacityUnits', 0);
    const duration = Math.floor(((timeTaken[0] * 1e9) + timeTaken[1]) / 1e6);
    requestRuntimes = [...requestRuntimes, duration];

    const failedStaffNumbers: string[] = [];
    if (get(result, `UnprocessedItems.${tableName}`)) {
      result.UnprocessedItems[tableName].forEach((writeRequest) => {
        const staffNumber = get(writeRequest, 'PutRequest.Item.staffNumber', '0');
        if (staffNumber !== '0') {
          failedStaffNumbers.push(staffNumber);
        }
      });

      failedStaffNumbers.forEach((staffNumber) => {
        warn(`failed to write hash for ${staffNumber}`);
      });

      const unprocessedWriteCount = failedStaffNumbers.length;
      totalUnprocessedWrites += unprocessedWriteCount;
      warn(`${unprocessedWriteCount} writes failed/throttled`);
    }

    const writtenHashes = writeBatch.filter((journal) => {
      // filter out any journals that failed to be written
      return !failedStaffNumbers.includes(journal.staffNumber);
    }).map((journal) => {
      return {
        staffNumber: journal.staffNumber,
        hash: journal.hash,
      } as Partial<JournalRecord>;
    });

    // cache the journals that were successfully written
    journalHashesCache.update(startTime, writtenHashes);
    totalWrittenJournals += writtenHashes.length;

    await sleep(sleepDuration);
  }

  info(`successfully written ${totalWrittenJournals} journals, took ${totalConsumedCapacity} WCUs`);
  customMetric('JournalsUpdated', 'Number of Journals successfully updated in Dynamo', totalWrittenJournals);

  const averageRequestRuntime = mean(requestRuntimes);
  return { totalUnprocessedWrites, averageRequestRuntime };
};

/**
 * Synchronous sleep.
 *
 * Only exported to support integration testing.
 *
 * @param ms The amount of milliseconds to sleep for
 */
export const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

/**
 * Determine whether we have run out of time to write any more journals to dynamo.
 *
 * @param startTime The date and time the Lambda function started
 * @param sleepDuration The amount of time we will sleep for
 * @returns true if we have run out of time, after the sleep duration
 */
const runOutOfTime = (startTime: Date, sleepDuration: number): boolean => {
  const current = now();
  // allow a couple of seconds leniency and the sleep duration
  const endOfTime = moment(startTime).add({ seconds: pollerFrequency - 2 }).subtract({ milliseconds: sleepDuration });
  return current.isAfter(endOfTime);
};

/**
 * Get the current date and time.
 *
 * Only exported to support integration testing.
 *
 * @returns the current date and time
 */
export const now = (): moment.Moment => {
  return moment();
};

/**
 * Get the staff numbers and journal hashes, for all examiners.
 * @param startTime The date and time the Lambda function started
 * @returns A Partial objecdt with staffNumber and hash populated
 */
export const getStaffNumbersWithHashes = async (startTime: Date): Promise<Partial<JournalRecord>[]> => {
  const ddb = getDynamoClient();
  const tableName = config().journalDynamodbTableName;

  const params: DynamoDB.DocumentClient.ScanInput = {
    TableName: tableName,
    ProjectionExpression: 'staffNumber,#hash',
    ExpressionAttributeNames: {
      '#hash': 'hash',
    },
    ReturnConsumedCapacity: 'TOTAL',
  };

  if (journalHashesCache.isValid(startTime)) {
    info('Journal Hashes Cache hit, using cached data');
    return Promise.resolve(journalHashesCache.get());
  }
  warn('Journal Hashes Cache miss, reading hashes from Dynamo');

  let scannedItems: Partial<JournalRecord>[] = [];
  let lastEvaluatedKey: Key | undefined;
  let totalConsumedCapacity = 0;
  do {
    const paramsForRequest = lastEvaluatedKey !== undefined ?
      { ...params, ExclusiveStartKey: lastEvaluatedKey }
      : { ...params };
    const start = process.hrtime();
    const result = await ddb.scan(paramsForRequest).promise();
    const timeTaken = process.hrtime(start);
    const duration = Math.floor(((timeTaken[0] * 1e9) + timeTaken[1]) / 1e6);
    scannedItems = [...scannedItems, ...result.Items as Partial<JournalRecord>[]];
    info(`scan of ${result.Items.length} journal hashes took ${duration} ms`);
    totalConsumedCapacity += get(result, 'ConsumedCapacity.CapacityUnits', 0);
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey !== undefined);

  info(`read ${scannedItems.length} journal hashes, took ${totalConsumedCapacity} RCUs`);
  journalHashesCache.clearAndPopulate(scannedItems, startTime);
  return scannedItems;
};
