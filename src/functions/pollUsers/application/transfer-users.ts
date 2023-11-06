import { info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { getCachedExaminers } from '../framework/databases/dynamodb/cached-examiner-repository';
import { getUniversalTestPermissions } from '../framework/repositories/get-universal-permissions';
import { reconcileActiveAndCachedExaminers } from './examiner-cache-reconciler';
import { getActiveExaminers } from '../framework/repositories/get-active-examiners';

export const transferUsers = async () => {
  const universalTestPermissions = await getUniversalTestPermissions();
  info(`Number of universal test permissions: ${universalTestPermissions.length}`);

  const activeStaffDetails = await getActiveExaminers(universalTestPermissions);
  info(`Number of active examiners: ${activeStaffDetails.length}`);

  const cachedStaffDetails = await getCachedExaminers();
  info(`Number of cached examiners: ${cachedStaffDetails.length}`);

  await reconcileActiveAndCachedExaminers(activeStaffDetails, cachedStaffDetails);
};
