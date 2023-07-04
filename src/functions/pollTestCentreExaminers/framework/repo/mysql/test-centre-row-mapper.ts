import { TestCentreRow } from './test-centre-repository';
import { Examiner, TestCentreDetail } from '../../../../../common/application/models/test-centre';

export const buildTestCentreRowsFromQueryResult = (
  queryResult: TestCentreRow[],
): TestCentreDetail[] => {
  return queryResult.map((row: TestCentreRow) => new TestCentreDetail(
    mapStaffNumber(row),
    mapExaminers(row),
    mapTestCentreIDs(row),
  ));
};

const mapStaffNumber = (row: TestCentreRow): number => +row.STAFF_NUMBER;

export const mapTestCentreIDs = (
  row: TestCentreRow,
): number[] => row.TEST_CENTRES
  .replace(/\s/g, '')   // remove whitespace in string if there is any
  .split(',')                         // split at each comma delimiter
  .filter((tcID: string) => tcID)              // filter any non defined values
  .map(Number);                                // convert all values to numbers

export const mapExaminers = (row: TestCentreRow): Examiner[] => JSON.parse(`[${row.STAFF_NUMBERS}]`);
