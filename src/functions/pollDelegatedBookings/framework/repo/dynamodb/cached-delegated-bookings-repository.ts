import { DeleteCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { customMetric, debug } from '@dvsa/mes-microservice-common/application/utils/logger';
import { config } from '../../../../../common/framework/config/config';
import { DelegatedBookingDetail } from '../../../../../common/application/models/delegated-booking-details';
import { fullScan, getDynamoClient } from '../../../../../common/framework/dynanmodb/dynamo-client';

export const getCachedDelegatedExaminerBookings = async (): Promise<DelegatedBookingDetail[]> => {
  const ddb = getDynamoClient();
  return await fullScan<DelegatedBookingDetail>(ddb, config().dynamodbTableName);
};

export const cacheDelegatedBookingDetails = async (delegatedBookings: DelegatedBookingDetail[]): Promise<void> => {
  const ddb = getDynamoClient();
  const tableName: string = config().dynamodbTableName;

  if (process.env.SKIP_DYNAMO_WRITE === 'true') {
    debug('cacheDelegatedBookingDetails - Skipping DynamoDB put', { delegatedBookingCount: delegatedBookings.length });
    return;
  }

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
  const ddb = getDynamoClient();
  const tableName: string = config().dynamodbTableName;

  if (process.env.SKIP_DYNAMO_WRITE === 'true') {
    debug('unCacheDelegatedBookingDetails - Skipping DynamoDB delete', { appRefCount: appRefs.length });
    return;
  }

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
