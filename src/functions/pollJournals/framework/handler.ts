import { bootstrapLogging, error } from '@dvsa/mes-microservice-common/application/utils/logger';
import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import type Response from '../../../common/application/api/Response';
import createResponse from '../../../common/application/utils/createResponse';
import { DdbTableTypes } from '../../../common/application/utils/ddbTable';
import { bootstrapConfig } from '../../../common/framework/config/config';
import { transferDatasets } from '../application/transfer-datasets';

export async function handler(event: APIGatewayProxyEvent, _fnCtx: Context): Promise<Response> {
  try {
    // cache the Lambda function start time
    const startTime = new Date();

    bootstrapLogging('journals-poller', event);
    await bootstrapConfig(DdbTableTypes.JOURNALS, true);
    await transferDatasets(startTime);
    return createResponse({});
  } catch (err) {
    error(err);
    return createResponse({}, 500);
  }
}
