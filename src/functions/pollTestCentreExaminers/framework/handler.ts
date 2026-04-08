import { bootstrapLogging, error } from '@dvsa/mes-microservice-common/application/utils/logger';
import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import type Response from '../../../common/application/api/Response';
import createResponse from '../../../common/application/utils/createResponse';
import { DdbTableTypes } from '../../../common/application/utils/ddbTable';
import { bootstrapConfig } from '../../../common/framework/config/config';
import { transferTestCentreExaminers } from '../domain/transfer-test-centre-examiners';

export async function handler(event: APIGatewayProxyEvent, _fnCtx: Context): Promise<Response> {
  try {
    bootstrapLogging('test-centre-poller', event);
    await bootstrapConfig(DdbTableTypes.TEST_CENTRE);
    await transferTestCentreExaminers();
    return createResponse({});
  } catch (err) {
    error(err);
    return createResponse({}, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
