import { DeleteCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { customMetric } from '@dvsa/mes-microservice-common/application/utils/logger';
import { config } from '../../../../../common/framework/config/config';
import { DelegatedBookingDetail } from '../../../../../common/application/models/delegated-booking-details';
import { getDynamoClient } from '../../../../../common/framework/dynanmodb/dynamo-client';

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
  const ddb = getDynamoClient();
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
  const ddb = getDynamoClient();
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
