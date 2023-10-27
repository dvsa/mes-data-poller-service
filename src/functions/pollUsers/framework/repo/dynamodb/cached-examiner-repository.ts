import { DynamoDBClient, DynamoDBClientConfig} from '@aws-sdk/client-dynamodb';
import { BatchWriteCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { customMetric } from '@dvsa/mes-microservice-common/application/utils/logger';
import { config } from '../../config';
import { chunk } from 'lodash';
import { StaffDetail } from '../../../../../common/application/models/staff-details';

const getDynamoClient = () =>  {
  const opts = { region: 'eu-west-1' } as DynamoDBClientConfig;

  if (config().isOffline) {
    opts.credentials = { accessKeyId: 'akid', secretAccessKey: 'secret', sessionToken: 'session' };
    opts.endpoint = 'http://localhost:8000';
    opts.region = 'localhost';
  }
  return new DynamoDBClient(opts);
};

export const getCachedExaminers = async (): Promise<StaffDetail[]> => {
  const ddb = getDynamoClient();

  const scanResult = await ddb.send(
    new ScanCommand({TableName: config().usersDynamodbTableName}),
  );

  if (!scanResult.Items) {
    return [];
  }

  return scanResult.Items as StaffDetail[];
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
    return ddb.send(new BatchWriteCommand(params));
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
    return ddb.send(new DeleteCommand(deleteParams));
  });

  await Promise.all(deletePromises);

  customMetric('UsersRemoved', 'Number of Users removed from Dynamo', staffNumbers.length);
};
