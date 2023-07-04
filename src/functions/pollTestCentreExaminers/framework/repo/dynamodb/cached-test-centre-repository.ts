import { customMetric } from '@dvsa/mes-microservice-common/application/utils/logger';
import { config as awsConfig, Credentials, DynamoDB } from 'aws-sdk';
import { config } from '../../config';
import { TestCentreDetail } from '../../../../../common/application/models/test-centre';

let dynamoDocumentClient: DynamoDB.DocumentClient;
const getDynamoClient: () => DynamoDB.DocumentClient = () => {
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

export const getCachedTestCentreExaminers = async (): Promise<TestCentreDetail[]> => {
  const ddb: DynamoDB.DocumentClient = getDynamoClient();
  const scanParams = {
    TableName: config().testCentreDynamodbTableName,
  };
  const scanResult = await ddb.scan(scanParams).promise();

  if (!scanResult.Items) {
    return [];
  }

  return scanResult.Items as TestCentreDetail[];
};

export const updateTestCentreExaminers = async (testCentres: TestCentreDetail[]): Promise<void> => {
  const ddb: DynamoDB.DocumentClient = getDynamoClient();
  const tableName: string = config().testCentreDynamodbTableName;

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
    return ddb.put(putParams).promise();
  });
  await Promise.all(putPromises);

  customMetric('TestCentreRowUpdated', 'Number of Test Centre rows updated from Dynamo', testCentres.length);
};

export const unCacheTestCentreExaminers = async (staffNumbers: number[]): Promise<void> => {
  const ddb: DynamoDB.DocumentClient = getDynamoClient();
  const tableName: string = config().testCentreDynamodbTableName;

  const deletePromises = staffNumbers.map((staffNumber: number) => {
    const deleteParams = {
      TableName: tableName,
      Key: {
        staffNumber,
      },
    };
    return ddb.delete(deleteParams).promise();
  });

  await Promise.all(deletePromises);

  customMetric('TestCentreRowRemoved', 'Number of Test Centre rows removed from Dynamo', staffNumbers.length);
};
