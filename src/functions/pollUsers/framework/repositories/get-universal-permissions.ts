import { TestPermissionPeriod } from '../../../../common/application/models/staff-details';
import { executeQuery, getConnection } from '../../../../common/framework/mysql/database';
import { UniversalPermissionRecordSql } from "../databases/mysql/universal-permissions";


interface UniversalPermissionRecord {
  test_category_ref: string;
  with_effect_from: Date;
  with_effect_to: Date | null;
}

export const getUniversalTestPermissions = async (): Promise<TestPermissionPeriod[]> => {

  const connection = getConnection();
  const queryResult = await executeQuery(connection, UniversalPermissionRecordSql());

  return queryResult.map(record => mapUniversalPermissionRecord(record));
};

const mapUniversalPermissionRecord = (record: UniversalPermissionRecord): TestPermissionPeriod => {
  const formatDate = (date: Date) => date === null ? null : date.toISOString().split('T')[0];
  return {
    testCategory: record.test_category_ref,
    from: formatDate(record.with_effect_from),
    to: formatDate(record.with_effect_to),
  };
};


