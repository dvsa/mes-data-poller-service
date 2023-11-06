import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import createResponse from '../../../common/application/utils/createResponse';
import Response from '../../../common/application/api/Response';
import { transferDatasets } from '../application/transfer-datasets';
import { bootstrapLogging, error } from '@dvsa/mes-microservice-common/application/utils/logger';
import { DdbTableTypes } from '../../../common/application/utils/ddbTable';
import { bootstrapConfig } from '../../../common/framework/config/config';

export async function handler(event: APIGatewayProxyEvent, fnCtx: Context): Promise<Response> {
  try {
    // cache the Lambda function start time
    const startTime = new Date();

    bootstrapLogging('journals-poller', event);
    await bootstrapConfig(DdbTableTypes.JOURNALS);
    await transferDatasets(startTime);
    return createResponse({});
  } catch (err) {
    error(err);
    return createResponse({}, 500);
  }
}
