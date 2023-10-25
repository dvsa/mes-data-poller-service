import { TestPermissionPeriod } from '../../../../../common/application/models/staff-details';
import {getConnection, query} from '../../../../../common/framework/mysql/database';
import * as mysql from 'mysql2';

interface UniversalPermissionRecord {
  test_category_ref: string;
  with_effect_from: Date;
  with_effect_to: Date | null;
}

export const getUniversalTestPermissions = async (): Promise<TestPermissionPeriod[]> => {
  const connection = getConnection();

  const [queryResult] = await connection.promise().query<mysql.RowDataPacket[]>(
      `
            SELECT test_category_ref,
                   with_effect_from,
                   with_effect_to
            FROM DES_TEST_CRITERIA
            WHERE examiner_staff_number IS NULL
        `,
  );

  return queryResult.map((record) => mapUniversalPermissionRecord(record as UniversalPermissionRecord));
};

const mapUniversalPermissionRecord = (record: UniversalPermissionRecord): TestPermissionPeriod => {
  const formatDate = (date: Date) => date === null ? null : date.toISOString().split('T')[0];
  return {
    testCategory: record.test_category_ref,
    from: formatDate(record.with_effect_from),
    to: formatDate(record.with_effect_to),
  };
};
