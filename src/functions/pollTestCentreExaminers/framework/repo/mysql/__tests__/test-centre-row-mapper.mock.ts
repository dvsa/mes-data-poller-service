import { TestCentreRow } from '../test-centre-repository';

export const mockTestCentreRows: TestCentreRow[] = [
  {
    INDIVIDUAL_ID: '1234567',
    STAFF_NUMBER: 1234567,
    // eslint-disable-next-line max-len
    STAFF_NUMBERS: '{"staffNumber": "000008", "name": "Test Examiner Seven"}, {"staffNumber": "000007", "name": "Test Examiner Six"}, {"staffNumber": "000006", "name": "Test Examiner Five"}',
    TEST_CENTRES: '1234, 9087',
  },
  {
    INDIVIDUAL_ID: '3242339',
    STAFF_NUMBER: 3242339,
    // eslint-disable-next-line max-len
    STAFF_NUMBERS: '{"staffNumber": "000004", "name": "Test Examiner Three"},{"staffNumber": "000009", "name": "Test Examiner Eight"},{"staffNumber": "000003", "name": "Test Examiner Two"}',
    TEST_CENTRES: '3452, 6578',
  },
];
