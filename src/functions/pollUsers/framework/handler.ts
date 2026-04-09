import { bootstrapLogging, error, info } from '@dvsa/mes-microservice-common/application/utils/logger';
import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import type Response from '../../../common/application/api/Response';
import createResponse from '../../../common/application/utils/createResponse';
import { DdbTableTypes } from '../../../common/application/utils/ddbTable';
import { bootstrapConfig } from '../../../common/framework/config/config';
import { transferUsers } from '../application/transfer-users';

export async function handler(event: APIGatewayProxyEvent, _fnCtx: Context): Promise<Response> {
  try {
    bootstrapLogging('users-poller', event);
    info('bootstrapping config');
    await bootstrapConfig(DdbTableTypes.USERS);
    info('transferring users');
    await transferUsers();
    return createResponse({});
  } catch (err) {
    error(err);
    return createResponse({}, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
