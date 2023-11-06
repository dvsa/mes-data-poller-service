import { defaultIfNotPresent } from '../../framework/config/config-helpers';

export enum DdbTableTypes {
  USERS = 'users',
  JOURNALS = 'journals',
  DELEGATED = 'delegated-bookings',
  TEST_CENTRE = 'test-centre'
}

export const ddbTable = (type: DdbTableTypes): string => {
  switch (type) {
  case DdbTableTypes.USERS:
    return defaultIfNotPresent(process.env.USERS_DDB_TABLE_NAME, DdbTableTypes.USERS);
  case DdbTableTypes.JOURNALS:
    return defaultIfNotPresent(process.env.JOURNALS_DDB_TABLE_NAME, DdbTableTypes.JOURNALS);
  case DdbTableTypes.DELEGATED:
    return defaultIfNotPresent(process.env.DELEGATED_BOOKINGS_DDB_TABLE_NAME, DdbTableTypes.DELEGATED);
  case DdbTableTypes.TEST_CENTRE:
    return defaultIfNotPresent(process.env.TEST_CENTRE_DDB_TABLE_NAME, DdbTableTypes.TEST_CENTRE);
  }

};
