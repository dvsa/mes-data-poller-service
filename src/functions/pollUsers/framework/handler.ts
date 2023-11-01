import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import createResponse from '../../../common/application/utils/createResponse';
import Response from '../../../common/application/api/Response';
import { transferUsers } from '../application/transfer-users';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import { bootstrapLogging, error } from '@dvsa/mes-microservice-common/application/utils/logger';
import { DdbTableTypes } from '../../../common/application/utils/ddbTable';
import { bootstrapConfig } from '../../../common/framework/config/config';

export async function handler(event: APIGatewayProxyEvent, fnCtx: Context): Promise<Response> {
  try {
    bootstrapLogging('users-poller', event);
    await bootstrapConfig(DdbTableTypes.USERS);
    await transferUsers();
    return createResponse({});
  } catch (err) {
    error(err);
    return createResponse({}, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
