import * as mysql from 'mysql2';
import * as moment from 'moment';
import { poolQuery } from '../../../../../common/framework/mysql/database';
import { info, customDurationMetric } from '@dvsa/mes-microservice-common/application/utils/logger';
import { ExaminerRecord } from '../../../domain/examiner-record';

/**
 * Get all active examiners, for the specified time window.
 * @param connectionPool The MySQL connection pool to use
 * @param startDate The start date of the time window
 * @returns The examiners
 */
export const getExaminers = async (connectionPool: mysql.Pool, startDate: Date): Promise<ExaminerRecord[]> => {
  const sqlYearFormat = 'YYYY-MM-DD';
  const windowStart = moment(startDate).format(sqlYearFormat);

  info(`Issued examiner query starting on ${windowStart}...`);
  const start = new Date();
  const res: ExaminerRecord[] = await poolQuery(
    connectionPool,
    mysql.format(
      `
          SELECT e.individual_id, e.staff_number
          FROM EXAMINER e
                   LEFT JOIN EXAMINER_STATUS es ON es.individual_id = e.individual_id
          WHERE IFNULL(e.grade_code, 'ZZZ') <> 'DELE'
            AND ? BETWEEN IFNULL(es.start_date, '1900-01-01') AND IFNULL(es.end_date, '4000-01-01')`,
      [windowStart],
    )
  );
  const end = new Date();
  info('examiner query returned');
  customDurationMetric('ExaminerQuery', 'Time taken querying examiners, in seconds', start, end);
  return res;
};
