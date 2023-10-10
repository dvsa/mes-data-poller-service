import { query } from '../../../../common/framework/mysql/database';
import { certificate } from '../../../../common/certs/ssl_profiles';
import * as mysql from 'mysql2';
import * as moment from 'moment';
import { StaffDetail, TestPermissionPeriod } from '../../../../common/application/models/staff-details';
import { buildStaffDetailsFromQueryResult } from './examiner-record-row-mapper';
import { config } from '../../../../common/framework/config/config';

export interface ExaminerQueryRecord {
  individual_id: number;
  staff_number: string;
  test_centre_manager_ind: number | null;
  test_category_ref: string | null;
  with_effect_from: Date | null;
  with_effect_to: Date | null;
}

export const getActiveExaminers = async (
  universalPermissionPeriods: TestPermissionPeriod[],
): Promise<StaffDetail[]> => {
  const configuration = config();

  const connection = mysql.createConnection({
    host: configuration.tarsReplicaDatabaseHostname,
    database: configuration.tarsReplicaDatabaseName,
    user: configuration.tarsReplicaDatabaseUsername,
    password: configuration.tarsReplicaDatabasePassword,
    charset: 'UTF8_GENERAL_CI',
    ssl: process.env.TESTING_MODE ? null : certificate,
    authSwitchHandler(data, cb) {
      if (data.pluginName === 'mysql_clear_password') {
        cb(null, Buffer.from(`${configuration.tarsReplicaDatabasePassword}\0`));
      }
    },
  });

  const queryResult: ExaminerQueryRecord[] = await query(
    connection,
    `
    select
      e.individual_id,
      e.staff_number,
      eg.test_centre_manager_ind,
      dtc.test_category_ref,
      dtc.with_effect_from,
      dtc.with_effect_to
    from EXAMINER e
      left join EXAMINER_STATUS es on es.individual_id = e.individual_id
      left join EXAMINER_GRADE eg on eg.examiner_grade_code = e.grade_code
      left join DES_TEST_CRITERIA dtc on dtc.examiner_staff_number = e.staff_number
    where IFNULL(e.grade_code, 'ZZZ') <> 'DELE'
    and IFNULL(es.end_date, '4000-01-01') >= ?
    `,
    [moment().format('YYYY-MM-DD')],
  );

  return buildStaffDetailsFromQueryResult(queryResult, universalPermissionPeriods);
};
