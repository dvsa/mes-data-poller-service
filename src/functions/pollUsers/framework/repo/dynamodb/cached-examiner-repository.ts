import { config as awsConfig, Credentials, DynamoDB } from 'aws-sdk';
import { chunk } from 'lodash';
import { StaffDetail } from '../../../../../common/application/models/staff-details';
import { customMetric } from '@dvsa/mes-microservice-common/application/utils/logger';
import {config} from "../../../../../common/framework/mysql/config";

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

export const getCachedExaminers = async (): Promise<StaffDetail[]> => {
  const ddb = getDynamoClient();
  const scanParams = {
    TableName: config().usersDynamodbTableName,
  };
  const scanResult = await ddb.scan(scanParams).promise();

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
