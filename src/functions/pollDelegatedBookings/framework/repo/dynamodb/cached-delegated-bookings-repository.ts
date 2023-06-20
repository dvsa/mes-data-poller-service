import { config as awsConfig, Credentials, DynamoDB } from 'aws-sdk';
import { customMetric } from '@dvsa/mes-microservice-common/application/utils/logger';
import { Key } from 'aws-sdk/clients/dynamodb';

import { config } from '../../config';
import { DelegatedBookingDetail } from '../../../../../common/application/models/delegated-booking-details';

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

export const getCachedDelegatedExaminerBookings = async (): Promise<DelegatedBookingDetail[]> => {
  const ddb = getDynamoClient();
  const tableName = config().delegatedBookingsDynamodbTableName;

  const params: DynamoDB.DocumentClient.ScanInput = {
    TableName: tableName,
  };

  let scannedItems: DelegatedBookingDetail[] = [];
  let lastEvaluatedKey: Key | undefined;
  do {
    const paramsForRequest = lastEvaluatedKey !== undefined ?
        { ...params, ExclusiveStartKey: lastEvaluatedKey }
        : { ...params };

    const result = await ddb.scan(paramsForRequest).promise();

    scannedItems = [
        ...scannedItems,
      ...result.Items as DelegatedBookingDetail[]
    ];

    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey !== undefined);

  return scannedItems;
};

export const cacheDelegatedBookingDetails = async (delegatedBookings: DelegatedBookingDetail[]): Promise<void> => {
  const ddb: DynamoDB.DocumentClient = getDynamoClient();
  const tableName: string = config().delegatedBookingsDynamodbTableName;

  const putPromises = delegatedBookings.map((delegatedBooking: DelegatedBookingDetail) => {
    const putParams = {
      TableName: tableName,
      Item: {
        applicationReference: delegatedBooking.applicationReference,
        bookingDetail: delegatedBooking.bookingDetail,
        staffNumber: delegatedBooking.staffNumber,
      },
    };
    return ddb.put(putParams).promise();
  });

  await Promise.all(putPromises);

  customMetric('DelegatedBookingAdded', 'Number of Delegated bookings updated in Dynamo', delegatedBookings.length);
};

export const unCacheDelegatedBookingDetails = async (appRefs: number[]): Promise<void> => {
  const ddb: DynamoDB.DocumentClient = getDynamoClient();
  const tableName: string = config().delegatedBookingsDynamodbTableName;

  const deletePromises = appRefs.map((applicationReference: number) => {
    const deleteParams = {
      TableName: tableName,
      Key: {
        applicationReference,
      },
    };
    return ddb.delete(deleteParams).promise();
  });

  await Promise.all(deletePromises);

  customMetric('DelegatedBookingRemoved', 'Number of Delegated Bookings removed from Dynamo', appRefs.length);
};
