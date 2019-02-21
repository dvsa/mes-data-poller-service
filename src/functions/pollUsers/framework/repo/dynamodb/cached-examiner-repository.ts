import { DynamoDB } from 'aws-sdk';
import { config } from '../../../../pollUsers/framework/config';
import { chunk } from 'lodash';

let dynamoDocumentClient: DynamoDB.DocumentClient;
const getDynamoClient = () => {
  if (!dynamoDocumentClient) {
    dynamoDocumentClient = config().isOffline
      ? new DynamoDB.DocumentClient({ endpoint: 'http://localhost:8000' })
      : new DynamoDB.DocumentClient();
  }
  return dynamoDocumentClient;
};

export const getCachedExaminers = async (): Promise<string[]> => {
  const ddb = getDynamoClient();
  const scanParams = {
    TableName: config().usersDynamodbTableName,
    ProjectionExpression: 'staffNumber',
  };
  const scanResult = await ddb.scan(scanParams).promise();

  if (!scanResult.Items) {
    return [];
  }

  return scanResult.Items.map(item => item.staffNumber);
};

export const cacheStaffNumbers = async (staffNumbers: string[]): Promise<void> => {
  const ddb = getDynamoClient();
  const tableName = config().usersDynamodbTableName;
  console.log(`caching ${staffNumbers.length} staff numbers`);

  const maxBatchWriteRequests = 25;
  const staffNumberWriteBatches = chunk(staffNumbers, maxBatchWriteRequests);

  const writePromises = staffNumberWriteBatches.map((batch) => {
    const params = {
      RequestItems: {
        [tableName]: batch.map(staffNumber => ({
          PutRequest: {
            Item: {
              staffNumber,
            },
          },
        })),
      },
    };
    return ddb.batchWrite(params).promise();
  });
  await Promise.all(writePromises);
};

export const uncacheStaffNumbers = async (staffNumbers: string[]): Promise<void> => {

};