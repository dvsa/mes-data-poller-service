import { BatchWriteCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { customMetric, debug } from '@dvsa/mes-microservice-common/application/utils/logger';
import { config } from '../../../../../common/framework/config/config';
import { chunk } from 'lodash';
import { StaffDetail } from '../../../../../common/application/models/staff-details';
import {fullScan, getDynamoClient} from '../../../../../common/framework/dynanmodb/dynamo-client';

export const getCachedExaminers = async (): Promise<StaffDetail[]> => {
  const ddb = getDynamoClient();
  return await fullScan<StaffDetail>(ddb, config().dynamodbTableName);
};

export const cacheStaffDetails = async (staffDetail: StaffDetail[]): Promise<void> => {
  const ddb = getDynamoClient();
  const tableName = config().dynamodbTableName;

  const maxBatchWriteRequests = 25;
  const staffDetailWriteBatches: StaffDetail[][] = chunk(staffDetail, maxBatchWriteRequests);

  if (process.env.SKIP_DYNAMO_WRITE === 'true') {
    debug('cacheStaffDetails - Skipping DynamoDB write', { staffCount: staffDetail.length });
    return;
  }

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
  const tableName = config().dynamodbTableName;

  if (process.env.SKIP_DYNAMO_WRITE === 'true') {
    debug('uncacheStaffNumbers - Skipping DynamoDB delete', { staffCount: staffNumbers.length });
    return;
  }

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
