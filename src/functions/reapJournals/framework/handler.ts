import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import createResponse from '../../../common/application/utils/createResponse';
import Response from '../../../common/application/api/Response';
import { bootstrapLogging, error } from '@dvsa/mes-microservice-common/application/utils/logger';
import { DdbTableTypes } from '../../../common/application/utils/ddbTable';
import { bootstrapReapJournalsConfig } from '../../../common/framework/config/config';
import { getInactiveExaminers } from './repositories/get-inactive-examiners';

export async function handler(event: APIGatewayProxyEvent, fnCtx: Context): Promise<Response> {
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
