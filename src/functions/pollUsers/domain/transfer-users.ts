import { getActiveExaminers } from '../framework/databases/mysql/examiner-repository';
import { getCachedExaminers } from '../framework/databases/dynamodb/cached-examiner-repository';
import { reconcileActiveAndCachedExaminers } from './examiner-cache-reconciler';
import { getUniversalTestPermissions } from '../framework/repositories/get-universal-permissions';

export const transferUsers = async () => {
  const universalTestPermissions = await getUniversalTestPermissions();
  const activeStaffDetails = await getActiveExaminers(universalTestPermissions);
  const cachedStaffDetails = await getCachedExaminers();
  await reconcileActiveAndCachedExaminers(activeStaffDetails, cachedStaffDetails);
};
