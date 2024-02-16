import {config} from '../config/config';
import {AttributeValue, DynamoDBClient, DynamoDBClientConfig} from '@aws-sdk/client-dynamodb';
import {ScanCommand, ScanCommandInput} from '@aws-sdk/lib-dynamodb';
import {error, info} from '@dvsa/mes-microservice-common/application/utils/logger';

/**
 * Creates the DynamoDB API client. If offline then points to the local endpoint. If online then enables HTTP keep
 * alive to improve performance, since TCP connect can take longer than the API call itself, and we are issuing
 * multiple API calls in a loop.
 *
 */
export const getDynamoClient = () => {
  const opts = {region: 'eu-west-1'} as DynamoDBClientConfig;

  if (config().isOffline) {
    opts.credentials = {accessKeyId: 'akid', secretAccessKey: 'secret', sessionToken: 'session'};
    opts.endpoint = 'http://localhost:8000';
    opts.region = 'localhost';
  }
  return new DynamoDBClient(opts);
};

export const fullScan = async <T>(
  ddb: DynamoDBClient,
  tableName: string,
): Promise<T[]> => {
  const rows: T[] = [];
  let lastEvaluatedKey: Record<string, AttributeValue> | undefined = undefined;

  const params = {
    TableName: tableName,
    ExclusiveStartKey: lastEvaluatedKey,
  } as ScanCommandInput;

  do {
    try {
      const data = await ddb.send(
        new ScanCommand(params)
      );

      if (data.Items) {
        info(`Found ${data.Items.length} items in DynamoDB`);
        rows.push(...data.Items as T[]);
      }

      lastEvaluatedKey = data.LastEvaluatedKey;
      params.ExclusiveStartKey = data.LastEvaluatedKey;
    } catch (err) {
      error('`ScanCommand` has thrown an error.', err);
      throw err;
    }
  } while (!!lastEvaluatedKey);

  return rows;
};
