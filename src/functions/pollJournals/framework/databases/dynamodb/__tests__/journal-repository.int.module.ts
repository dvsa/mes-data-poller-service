import {DynamoDBDocument, PutCommand} from '@aws-sdk/lib-dynamodb';
import { DynamoDB, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import * as dotenv from 'dotenv';
import { getStaffNumbersWithHashes } from '../journal-repository';
import { bootstrapConfig } from '../../../../../../common/framework/config/config';
import { DdbTableTypes } from "../../../../../../common/application/utils/ddbTable";

let ddb: DynamoDBClient;
export const dynamoDBIntegrationTests = () => {
  describe('DynamoDB integration tests', () => {

    beforeAll((done) => {
      ddb = DynamoDBDocument.from(new DynamoDB({
        endpoint: 'http://localhost:8000',
        region: 'localhost',
        credentials: {
          accessKeyId: 'akid',
          secretAccessKey: 'secret',
          sessionToken: 'session',
        },
      }));
      process.env.IS_OFFLINE = 'true';
      process.env.NODE_ENV = 'local';
      dotenv.config();
      bootstrapConfig(DdbTableTypes.JOURNALS).then(() => {
        done();
      });
    });

    describe('getStaffNumbersWithHashes', () => {
      it('should fetch every staff number and the hash of their journal from DynamoDB', async () => {
        await putStaffNumberAndHash('123', 'abc');
        await putStaffNumberAndHash('456', 'xyz');

        const result = await getStaffNumbersWithHashes(new Date());

        expect(result.length).toBe(2);
        expect(result).toContain({ staffNumber: '123', hash: 'abc' });
        expect(result).toContain({ staffNumber: '456', hash: 'xyz' });
      });
    });
  });
};

const putStaffNumberAndHash = (staffNumber: string, hash: string) => {
  return ddb.send(new PutCommand({
    TableName: 'journals',
    Item: {
      staffNumber,
      hash,
    },
  }));
};
