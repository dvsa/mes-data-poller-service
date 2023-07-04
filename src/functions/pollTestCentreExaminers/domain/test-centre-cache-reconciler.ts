import { differenceBy, get, isEqual } from 'lodash';
import { TestCentreDetail } from '../../../common/application/models/test-centre';
import {
  unCacheTestCentreExaminers,
  updateTestCentreExaminers,
} from '../framework/repo/dynamodb/cached-test-centre-repository';

export const reconcileActiveAndCachedTestCentreRows = async (
  activeTestCentreRows: TestCentreDetail[],
  cachedTestCentreRows: TestCentreDetail[],
): Promise<void> => {

  // determine staffNumbers that are no longer active
  const cachedTestCentresEligibleForDeletion: number[] =
    extractCachedTestCentresForDeletion(cachedTestCentreRows, activeTestCentreRows)
      .map((testCentre: TestCentreDetail) => testCentre.staffNumber);

  await unCacheTestCentreExaminers(cachedTestCentresEligibleForDeletion);

  // determine which rows are identical between active and cached
  const unchangedRows: TestCentreDetail[] = getUnChangedRows(activeTestCentreRows, cachedTestCentreRows);
  // if a row is unchanged and therefore does not require updating, it will be removed here
  const updateRows: TestCentreDetail[] = removeUnchangedFromUpdateList(activeTestCentreRows, unchangedRows);
  // update Dynamo using updateRows
  await updateTestCentreExaminers(updateRows);
};

const extractCachedTestCentresForDeletion = (
  cachedTestCentreRows: TestCentreDetail[],
  activeTestCentreRows: TestCentreDetail[],
): TestCentreDetail[] => {
  const activeStaffNumbers: number[] = activeTestCentreRows.map((row: TestCentreDetail) => row.staffNumber);

  return cachedTestCentreRows
    .filter((row: TestCentreDetail) => !activeStaffNumbers.includes(row.staffNumber));
};

export const getUnChangedRows = (
  activeTestCentreRows: TestCentreDetail[],
  cachedTestCentreRows: TestCentreDetail[],
): TestCentreDetail[] => {

  return activeTestCentreRows.filter((row: TestCentreDetail) => {
    const cachedRow = cachedTestCentreRows.find((t: TestCentreDetail) => t.staffNumber === row.staffNumber);
    return isEqual(row, new TestCentreDetail(
      get(cachedRow, 'staffNumber'),
      get(cachedRow, 'examiners'),
      get(cachedRow, 'testCentreIDs'),
    ));
  });
};

const removeUnchangedFromUpdateList = (
  activeTestCentreRows: TestCentreDetail[],
  unchangedTestCentres: TestCentreDetail[],
): TestCentreDetail[] => differenceBy(activeTestCentreRows, unchangedTestCentres, 'staffNumber');
