import * as mysql from 'mysql2';
import * as moment from 'moment';

export const ActiveExaminersSql = (): string => {
  const template = `
      SELECT
          e.individual_id,
          e.staff_number,
          eg.test_centre_manager_ind,
          dtc.test_category_ref,
          dtc.with_effect_from,
          dtc.with_effect_to
      FROM
          EXAMINER e
              LEFT JOIN EXAMINER_STATUS es ON es.individual_id = e.individual_id
              LEFT JOIN EXAMINER_GRADE eg ON eg.examiner_grade_code = e.grade_code
              LEFT JOIN DES_TEST_CRITERIA dtc ON dtc.examiner_staff_number = e.staff_number
      WHERE
          IFNULL(e.grade_code, 'ZZZ') <> 'DELE'
        AND IFNULL(es.end_date, '4000-01-01') >= ?`;

  const args =     [moment().format('YYYY-MM-DD')];

  return mysql.format(template, args);
};
