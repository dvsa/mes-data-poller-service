import { UniversalPermissionRecordSql } from '../databases/mysql/universal-permissions';
import { TestPermissionPeriod } from '../../../../common/application/models/staff-details';
import { getConnection, query } from '../../../../common/framework/mysql/database';


interface UniversalPermissionRecord {
  test_category_ref: string;
  with_effect_from: Date;
  with_effect_to: Date | null;
}

export const getUniversalTestPermissions = async () => {

  const connection = getConnection();
  const queryResult = await query(connection, UniversalPermissionRecordSql());
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


