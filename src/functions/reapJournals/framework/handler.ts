import { bootstrapLogging, error } from '@dvsa/mes-microservice-common/application/utils/logger';
import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import type Response from '../../../common/application/api/Response';
import createResponse from '../../../common/application/utils/createResponse';
import { DdbTableTypes } from '../../../common/application/utils/ddbTable';
import { bootstrapReapJournalsConfig } from '../../../common/framework/config/config';
import { getInactiveExaminers } from './repositories/get-inactive-examiners';

export async function handler(event: APIGatewayProxyEvent, _fnCtx: Context): Promise<Response> {
  try {
    bootstrapLogging('journals-reaper', event);
    await bootstrapReapJournalsConfig(DdbTableTypes.JOURNALS);
    await getInactiveExaminers();
    return createResponse({});
  } catch (err) {
    error(err);
    return createResponse({}, 500);
  }
}
