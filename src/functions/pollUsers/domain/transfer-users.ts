import { getActiveExaminers } from '../framework/repo/mysql/examiner-repository';
import { getCachedExaminers } from '../framework/repo/dynamodb/cached-examiner-repository';
import { reconcileActiveAndCachedExaminers } from './examiner-cache-reconciler';
import { getUniversalTestPermissions } from '../framework/repo/mysql/universal-permissions-repository';
import {info} from '@dvsa/mes-microservice-common/application/utils/logger';

export const transferUsers = async () => {
  const universalTestPermissions = await getUniversalTestPermissions();

  const activeStaffDetails = await getActiveExaminers(universalTestPermissions);
  info(`Found ${activeStaffDetails.length} active examiner in DynamoDB`);

  const cachedStaffDetails = await getCachedExaminers();
  info(`Found ${cachedStaffDetails.length} cached examiner in DynamoDB`);

  await reconcileActiveAndCachedExaminers(activeStaffDetails, cachedStaffDetails);
};
