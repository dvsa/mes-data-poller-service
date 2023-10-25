import { bootstrapLogging, error } from '@dvsa/mes-microservice-common/application/utils/logger';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

import Response from '../../../common/application/api/Response';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import { transferTestCentreExaminers } from '../domain/transfer-test-centre-examiners';
import { bootstrapConfig } from "../../../common/framework/mysql/config";

export async function handler(event: APIGatewayProxyEvent, fnCtx: Context): Promise<Response> {
  try {
    bootstrapLogging('test-centre-poller', event);
    await bootstrapConfig();
    await transferTestCentreExaminers();
    return createResponse({});
  } catch (err) {
    error(err);
    return createResponse({}, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
