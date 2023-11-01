import { customMetric } from '@dvsa/mes-microservice-common/application/utils/logger';
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { config } from '../../../../../common/framework/config/config';
import { TestCentreDetail } from '../../../../../common/application/models/test-centre';
import { DeleteCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const getDynamoClient = () =>  {
  const opts = { region: 'eu-west-1' } as DynamoDBClientConfig;

  if (config().isOffline) {
    opts.credentials = { accessKeyId: 'akid', secretAccessKey: 'secret', sessionToken: 'session' };
    opts.endpoint = 'http://localhost:8000';
    opts.region = 'localhost';
  }
  return new DynamoDBClient(opts);
};

export const getCachedTestCentreExaminers = async (): Promise<TestCentreDetail[]> => {
  const ddb = getDynamoClient();

  const scanResult = await ddb.send(
    new ScanCommand({
      TableName: config().dynamodbTableName,
    }),
  );

  if (!scanResult.Items) {
    return [];
  }

  return scanResult.Items as TestCentreDetail[];
};

export const updateTestCentreExaminers = async (testCentres: TestCentreDetail[]): Promise<void> => {
  const ddb = getDynamoClient();
  const tableName = config().dynamodbTableName;

  // will update row using a put and add new rows if staffNumber not found
  const putPromises = testCentres.map((testCentre: TestCentreDetail) => {
    const putParams = {
      TableName: tableName,
      Item: {
        staffNumber: testCentre.staffNumber,
        examiners: testCentre.examiners,
        testCentreIDs: testCentre.testCentreIDs,
      },
    };
    return ddb.send(new PutCommand(putParams));
  });
  await Promise.all(putPromises);

  customMetric('TestCentreRowUpdated', 'Number of Test Centre rows updated from Dynamo', testCentres.length);
};

export const unCacheTestCentreExaminers = async (staffNumbers: string[]): Promise<void> => {
  const ddb = getDynamoClient();
  const tableName: string = config().dynamodbTableName;

  const deletePromises = staffNumbers.map((staffNumber: string) => {
    const deleteParams = {
      TableName: tableName,
      Key: {
        staffNumber,
      },
    };
    return ddb.send(new DeleteCommand(deleteParams));
  });

  await Promise.all(deletePromises);

  customMetric('TestCentreRowRemoved', 'Number of Test Centre rows removed from Dynamo', staffNumbers.length);
};
