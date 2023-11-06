import { info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { getCachedTestCentreExaminers } from '../framework/repo/dynamodb/cached-test-centre-repository';
import { getActiveTestCentreExaminers } from '../framework/repo/mysql/test-centre-repository';
import { TestCentreDetail } from '../../../common/application/models/test-centre';
import { reconcileActiveAndCachedTestCentreRows } from './test-centre-cache-reconciler';

export const transferTestCentreExaminers = async (): Promise<void> => {
  const activeTestCentres: TestCentreDetail[] = await getActiveTestCentreExaminers();
  info(`Number of active test centre rows: ${activeTestCentres.length}`);

  const cachedTestCentres: TestCentreDetail[] = await getCachedTestCentreExaminers();
  info(`Number of cached test centre rows: ${cachedTestCentres.length}`);

  await reconcileActiveAndCachedTestCentreRows(
    activeTestCentres,
    cachedTestCentres,
  );
};
