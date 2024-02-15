import { config as awsConfig, Credentials, DynamoDB } from 'aws-sdk';
import { config } from '../../../../pollUsers/framework/config';
import { chunk } from 'lodash';
import { StaffDetail } from '../../../../../common/application/models/staff-details';
import { customMetric } from '@dvsa/mes-microservice-common/application/utils/logger';
import {AttributeValue} from 'aws-lambda';

let dynamoDocumentClient: DynamoDB.DocumentClient;
const getDynamoClient = () => {
  if (!dynamoDocumentClient) {
    if (config().isOffline) {
      const localRegion = 'localhost';
      awsConfig.update({
        region: localRegion,
        credentials: new Credentials('akid', 'secret', 'session'),
      });
      dynamoDocumentClient = new DynamoDB.DocumentClient({ endpoint: 'http://localhost:8000', region: localRegion });
    } else {
      dynamoDocumentClient = new DynamoDB.DocumentClient();
    }
  }
  return dynamoDocumentClient;
};

// @TODO: This should be repurposed to scan any table recursively by passing in the `TableName`
export const getCachedExaminers = async (): Promise<StaffDetail[]> => {
  const ddb = getDynamoClient();

  const rows: StaffDetail[] = [];
  let lastEvaluatedKey: Record<string, AttributeValue> | undefined = undefined;

  const scanParams = {
    TableName: config().usersDynamodbTableName,
    ExclusiveStartKey: lastEvaluatedKey,
  };

  do {
    try {
      const data = await ddb.scan(scanParams).promise();

      if (data.Items) rows.push(...data.Items as StaffDetail[]);

      lastEvaluatedKey = data.LastEvaluatedKey;
      scanParams.ExclusiveStartKey = data.LastEvaluatedKey;
    } catch (err) {
      console.error('[ERROR]: `ScanCommand` has thrown an error.', err);
      throw err;
    }
  } while (!!lastEvaluatedKey);

  return rows as StaffDetail[];
};

export const cacheStaffDetails = async (staffDetail: StaffDetail[]): Promise<void> => {
  const ddb = getDynamoClient();
  const tableName = config().usersDynamodbTableName;

  const maxBatchWriteRequests = 25;
  const staffDetailWriteBatches: StaffDetail[][] = chunk(staffDetail, maxBatchWriteRequests);

  const writePromises = staffDetailWriteBatches.map((batch) => {
    const params = {
      RequestItems: {
        [tableName]: batch.map(staffDetail => ({
          PutRequest: {
            Item: staffDetail,
          },
        })),
      },
    };
    return ddb.batchWrite(params).promise();
  });

  await Promise.all(writePromises);

  customMetric('UsersAdded', 'Number of Users added to Dynamo', staffDetail.length);
};

export const uncacheStaffNumbers = async (staffNumbers: string[]): Promise<void> => {
  const ddb = getDynamoClient();
  const tableName = config().usersDynamodbTableName;

  const deletePromises = staffNumbers.map((staffNumber) => {
    const deleteParams = {
      TableName: tableName,
      Key: {
        staffNumber,
      },
    };
    return ddb.delete(deleteParams).promise();
  });

  await Promise.all(deletePromises);

  customMetric('UsersRemoved', 'Number of Users removed from Dynamo', staffNumbers.length);
};
