import {DeleteCommand, PutCommand, ScanCommand} from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { customMetric } from '@dvsa/mes-microservice-common/application/utils/logger';
import { config } from '../../config';
import { DelegatedBookingDetail } from '../../../../../common/application/models/delegated-booking-details';

const getDynamoClient = () =>  {
  const opts = { region: 'eu-west-1' } as DynamoDBClientConfig;

  if (config().isOffline) {
    opts.credentials = { accessKeyId: 'akid', secretAccessKey: 'secret', sessionToken: 'session' };
    opts.endpoint = 'http://localhost:8000';
    opts.region = 'localhost';
  }
  return new DynamoDBClient(opts);
};

export const getCachedDelegatedExaminerBookings = async (): Promise<DelegatedBookingDetail[]> => {
  const ddb = getDynamoClient();

  const scanResult = await ddb.send(
    new ScanCommand({
      TableName: config().dynamodbTableName,
    })
  );

  if (!scanResult.Items) {
    return [];
  }

  return scanResult.Items as DelegatedBookingDetail[];
};

export const cacheDelegatedBookingDetails = async (delegatedBookings: DelegatedBookingDetail[]): Promise<void> => {
  const ddb: DynamoDB.DocumentClient = getDynamoClient();
  const tableName: string = config().dynamodbTableName;

  const putPromises = delegatedBookings.map((delegatedBooking: DelegatedBookingDetail) => {
    const putParams = {
      TableName: tableName,
      Item: {
        applicationReference: delegatedBooking.applicationReference,
        bookingDetail: delegatedBooking.bookingDetail,
        staffNumber: delegatedBooking.staffNumber,
      },
    };
    return ddb.send(new PutCommand(putParams));
  });

  await Promise.all(putPromises);

  customMetric('DelegatedBookingAdded', 'Number of Delegated bookings updated in Dynamo', delegatedBookings.length);
};

export const unCacheDelegatedBookingDetails = async (appRefs: number[]): Promise<void> => {
  const ddb: DynamoDB.DocumentClient = getDynamoClient();
  const tableName: string = config().dynamodbTableName;

  const deletePromises = appRefs.map((applicationReference: number) => {
    const deleteParams = {
      TableName: tableName,
      Key: { applicationReference },
    };
    return ddb.send(new DeleteCommand(deleteParams));
  });

  await Promise.all(deletePromises);

  customMetric('DelegatedBookingRemoved', 'Number of Delegated Bookings removed from Dynamo', appRefs.length);
};
