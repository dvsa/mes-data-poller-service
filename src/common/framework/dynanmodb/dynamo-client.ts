import { config } from '../config/config';
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';

/**
 * Creates the DynamoDB API client. If offline then points to the local endpoint. If online then enables HTTP keep
 * alive to improve performance, since TCP connect can take longer than the API call itself, and we are issuing
 * multiple API calls in a loop.
 *
 */
export const getDynamoClient = () =>  {
  const opts = { region: 'eu-west-1' } as DynamoDBClientConfig;

  if (config().isOffline) {
    opts.credentials = { accessKeyId: 'akid', secretAccessKey: 'secret', sessionToken: 'session' };
    opts.endpoint = 'http://localhost:8000';
    opts.region = 'localhost';
  }
  return new DynamoDBClient(opts);
};
