import { TestPermissionPeriod } from '../../../../../common/application/models/staff-details';
import { config } from '../../config';
import { certificate } from '../../../../../common/certs/ssl_profiles';
import * as mysql from 'mysql2';
import { query } from '../../../../../common/framework/mysql/database';

interface UniversalPermissionRecord {
  test_category_ref: string;
  with_effect_from: Date;
  with_effect_to: Date | null;
}

export const getUniversalTestPermissions = async (): Promise<TestPermissionPeriod[]> => {
  const configuration = config();

  const connection = mysql.createConnection({
    host: configuration.tarsReplicaDatabaseHostname,
    database: configuration.tarsReplicaDatabaseName,
    user: configuration.tarsReplicaDatabaseUsername,
    password: configuration.tarsReplicaDatabasePassword,
    charset: 'UTF8_GENERAL_CI',
    ssl: process.env.TESTING_MODE ? null : certificate,
    authPlugins: {
      mysql_clear_password: () => () => Buffer.from(`${configuration.tarsReplicaDatabasePassword}\0`),
    },
  });

  const [queryResult] = await query(
    connection,
    `
    SELECT
      test_category_ref,
      with_effect_from,
      with_effect_to
    FROM
      DES_TEST_CRITERIA
    WHERE
      examiner_staff_number IS NULL
    `,
  );

  return (queryResult as UniversalPermissionRecord[]).map(
    (record) => mapUniversalPermissionRecord(record),
  );
};

const mapUniversalPermissionRecord = (record: UniversalPermissionRecord): TestPermissionPeriod => {
  const formatDate = (date: Date) => date === null ? null : date.toISOString().split('T')[0];
  return {
    testCategory: record.test_category_ref,
    from: formatDate(record.with_effect_from),
    to: formatDate(record.with_effect_to),
  };
};
