import { DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { info, warn } from '@dvsa/mes-microservice-common/application/utils/logger';
import * as moment from 'moment';
import { config } from '../../../../../common/framework/config/config';
import { getDynamoClient } from '../../../../../common/framework/dynanmodb/dynamo-client';

/**
 * Identifies inactive journals by scanning a DynamoDB table and filtering records
 * where the `lastUpdatedAt` attribute is older than 3 months.
 *
 * @returns {Promise<string[]>} A promise that resolves to an array of staff numbers
 *                              corresponding to inactive journals.
 */
export const identifyInactiveJournals = async (): Promise<string[]> => {
  const ddb = getDynamoClient();
  const tableName = config().dynamodbTableName;

  const threeMonthsAgo = moment().subtract(3, 'months').valueOf();

  const params = {
    TableName: tableName,
    ProjectionExpression: 'staffNumber, lastUpdatedAt',
  };

  let inactiveStaffNumbers: string[] = [];
  let lastEvaluatedKey: any;

  do {
    const result = await ddb.send(new ScanCommand({ ...params, ExclusiveStartKey: lastEvaluatedKey }));
    const dynamoStaffNumbers =
      result.Items?.filter((item) => item.lastUpdatedAt < threeMonthsAgo).map((item) => item.staffNumber) || [];
    inactiveStaffNumbers = [...inactiveStaffNumbers, ...dynamoStaffNumbers];
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  info(`Identified ${inactiveStaffNumbers.length} inactive journals.`);
  return inactiveStaffNumbers;
};

/**
 * Removes inactive journals from DynamoDB.
 * @param inactiveStaffNumbers List of inactive staff numbers to remove.
 */
export const removeInactiveJournals = async (inactiveStaffNumbers: string[]): Promise<void> => {
  if (inactiveStaffNumbers.length === 0) {
    info('No inactive journals to remove.');
    return;
  }

  const ddb = getDynamoClient();
  const tableName = config().dynamodbTableName;

  for (const staffNumber of inactiveStaffNumbers) {
    try {
      await ddb.send(
        new DeleteCommand({
          TableName: tableName,
          Key: { staffNumber },
        })
      );
      info(`Removed journal for staff number: ${staffNumber}`);
    } catch (error) {
      warn(`Failed to remove journal for staff number: ${staffNumber}`, error);
    }
  }
};
