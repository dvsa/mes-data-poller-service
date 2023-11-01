import { bootstrapLogging, error, info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { APIGatewayProxyEvent } from 'aws-lambda';

import Response from '../../../common/application/api/Response';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import { bootstrapConfig } from '../../../common/framework/config/config';
import { DdbTableTypes } from '../../../common/application/utils/ddbTable';
import { transferDelegatedBookings } from '../domain/transfer-delegated-bookings';

export async function handler(event: APIGatewayProxyEvent): Promise<Response> {
  try {
    bootstrapLogging('delegated-bookings-poller', event);

    await bootstrapConfig(DdbTableTypes.DELEGATED);

    info('Start transfer of bookings');

    await transferDelegatedBookings();
    return createResponse({});
  } catch (err) {
    error(err);
    return createResponse({}, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
