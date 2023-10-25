import {getConnection, query} from '../../../../../common/framework/mysql/database';
import moment from 'moment';
import * as mysql from 'mysql2';
import { StaffDetail, TestPermissionPeriod } from '../../../../../common/application/models/staff-details';
import { buildStaffDetailsFromQueryResult } from './examiner-record-row-mapper';

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
  const connection = getConnection();

  // const queryResult: ExaminerQueryRecord[] = await query(
  //   connection,
  //   `
  //   select
  //     e.individual_id,
  //     e.staff_number,
  //     eg.test_centre_manager_ind,
  //     dtc.test_category_ref,
  //     dtc.with_effect_from,
  //     dtc.with_effect_to
  //   from EXAMINER e
  //     left join EXAMINER_STATUS es on es.individual_id = e.individual_id
  //     left join EXAMINER_GRADE eg on eg.examiner_grade_code = e.grade_code
  //     left join DES_TEST_CRITERIA dtc on dtc.examiner_staff_number = e.staff_number
  //   where IFNULL(e.grade_code, 'ZZZ') <> 'DELE'
  //   and IFNULL(es.end_date, '4000-01-01') >= ?
  //   `,
  //   [moment().format('YYYY-MM-DD')],
  // );

  const [queryResult] = await connection.promise().query<mysql.RowDataPacket[]>(
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

  return buildStaffDetailsFromQueryResult(queryResult as ExaminerQueryRecord[], universalPermissionPeriods);
};
