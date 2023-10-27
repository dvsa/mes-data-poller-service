import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import createResponse from '../../../common/application/utils/createResponse';
import Response from '../../../common/application/api/Response';
import { bootstrapConfig } from './config';
import { transferUsers } from '../domain/transfer-users';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import { bootstrapLogging, error } from '@dvsa/mes-microservice-common/application/utils/logger';

export async function handler(event: APIGatewayProxyEvent, fnCtx: Context): Promise<Response> {
  try {
    bootstrapLogging('users-poller', event);
    await bootstrapConfig();
    await transferUsers();
    return createResponse({});
  } catch (err) {
    error(err);
    return createResponse({}, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
