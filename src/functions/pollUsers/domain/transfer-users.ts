import { getActiveExaminers } from '../framework/repo/mysql/examiner-repository';
import { getCachedExaminers } from '../framework/repo/dynamodb/cached-examiner-repository';
import { reconcileActiveAndCachedExaminers } from './examiner-cache-reconciler';
import { getUniversalTestPermissions } from '../framework/repo/mysql/universal-permissions-repository';

export const transferUsers = async () => {
  console.log('insinde transferUsers');
  const universalTestPermissions = await getUniversalTestPermissions();
  console.log('getActiveExaminers');
  const activeStaffDetails = await getActiveExaminers(universalTestPermissions);
  console.log('getCachedExaminers');
  const cachedStaffDetails = await getCachedExaminers();
  await reconcileActiveAndCachedExaminers(activeStaffDetails, cachedStaffDetails);
};
