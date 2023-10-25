import { defaultIfNotPresent } from "../../framework/config/config-helpers";

export enum DdbTableTypes {
  USERS = 'users',
  JOURNALS = 'journals'
}

export const ddbTable = (type: DdbTableTypes): string => {
  switch (type) {
    case DdbTableTypes.USERS:
      return defaultIfNotPresent(process.env.USERS_DDB_TABLE_NAME, DdbTableTypes.USERS)
    case DdbTableTypes.JOURNALS:
      return defaultIfNotPresent(process.env.JOURNALS_DDB_TABLE_NAME, DdbTableTypes.JOURNALS)
  }

};