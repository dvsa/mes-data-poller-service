import { type Examiner, TestCentreDetail } from '../../../../../common/application/models/test-centre';
import type { TestCentreRow } from '../../../../../common/application/models/test-centre-journal';
import { trimLeadingZeroes } from '../../../../../common/application/utils/trimLeadingZeros';

export const buildTestCentreRowsFromQueryResult = (queryResult: TestCentreRow[]): TestCentreDetail[] => {
  return queryResult.map(
    (row: TestCentreRow) => new TestCentreDetail(mapStaffNumber(row), mapExaminers(row), mapTestCentreCostCodes(row))
  );
};

const mapStaffNumber = (row: TestCentreRow): string => trimLeadingZeroes(row.STAFF_NUMBER);

export const mapTestCentreCostCodes = (row: TestCentreRow): string[] =>
  row.TEST_CENTRES.replace(/\s/g, '') // remove whitespace in string if there is any
    .split(',') // split at each comma delimiter
    .filter((tcCC: string) => tcCC); // filter any non defined values

export const mapExaminers = (row: TestCentreRow): Examiner[] => JSON.parse(`[${row.STAFF_NUMBERS}]`);
