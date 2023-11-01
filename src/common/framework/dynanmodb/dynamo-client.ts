import { config as awsConfig, Credentials, DynamoDB } from 'aws-sdk';
import { config } from '../config/config';


/**
 * Creates the DynamoDB API client. If offline then points to the local endpoint. If online then enables HTTP keep
 * alive to improve performance, since TCP connect can take longer than the API call itself, and we are issuing
 * multiple API calls in a loop.
 *
 */
export const getDynamoClient: () => DynamoDB.DocumentClient = () => {
  let dynamoDocumentClient: DynamoDB.DocumentClient;

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
