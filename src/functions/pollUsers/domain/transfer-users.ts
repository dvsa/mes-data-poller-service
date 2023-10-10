import { getActiveExaminers } from '../framework/mysql/examiner-repository';
import { getCachedExaminers } from '../framework/dynamodb/cached-examiner-repository';
import { reconcileActiveAndCachedExaminers } from './examiner-cache-reconciler';
import { getUniversalTestPermissions } from '../framework/mysql/universal-permissions-repository';

export const transferUsers = async () => {
  const universalTestPermissions = await getUniversalTestPermissions();
  const activeStaffDetails = await getActiveExaminers(universalTestPermissions);
  const cachedStaffDetails = await getCachedExaminers();
  await reconcileActiveAndCachedExaminers(activeStaffDetails, cachedStaffDetails);
};
