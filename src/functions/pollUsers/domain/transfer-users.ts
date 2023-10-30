import { info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { getActiveExaminers } from '../framework/repo/mysql/examiner-repository';
import { getCachedExaminers } from '../framework/repo/dynamodb/cached-examiner-repository';
import { reconcileActiveAndCachedExaminers } from './examiner-cache-reconciler';
import { getUniversalTestPermissions } from '../framework/repo/mysql/universal-permissions-repository';

export const transferUsers = async () => {
  const universalTestPermissions = await getUniversalTestPermissions();
  info(`Number of universal test permissions: ${universalTestPermissions.length}`);

  const activeStaffDetails = await getActiveExaminers(universalTestPermissions);
  info(`Number of active examiners: ${activeStaffDetails.length}`);

  const cachedStaffDetails = await getCachedExaminers();
  info(`Number of cached examiners: ${cachedStaffDetails.length}`);

  await reconcileActiveAndCachedExaminers(activeStaffDetails, cachedStaffDetails);
};
