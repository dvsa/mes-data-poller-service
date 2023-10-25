import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import createResponse from '../../../common/application/utils/createResponse';
import Response from '../../../common/application/api/Response';
import { transferUsers } from '../domain/transfer-users';
import { bootstrapConfig } from "../../../common/framework/mysql/config";
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import { bootstrapLogging, error } from '@dvsa/mes-microservice-common/application/utils/logger';

export async function handler(event: APIGatewayProxyEvent, fnCtx: Context): Promise<Response> {
  try {
    bootstrapLogging('users-poller', event);
    console.log('logging');
    await bootstrapConfig();
    console.log('config');
    await transferUsers();
    console.log('users');
    return createResponse({});
  } catch (err) {
    error(err);
    return createResponse({}, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
