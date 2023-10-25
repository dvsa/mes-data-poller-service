import { bootstrapLogging, error } from '@dvsa/mes-microservice-common/application/utils/logger';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

import Response from '../../../common/application/api/Response';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import { transferDelegatedBookings } from '../domain/transfer-delegated-bookings';
import {bootstrapConfig} from "../../../common/framework/mysql/config";

export async function handler(event: APIGatewayProxyEvent, fnCtx: Context): Promise<Response> {
  try {
    bootstrapLogging('delegated-bookings-poller', event);
    await bootstrapConfig();
    await transferDelegatedBookings();
    return createResponse({});
  } catch (err) {
    error(err);
    return createResponse({}, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
