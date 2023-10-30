import * as mysql from 'mysql2';
import * as moment from 'moment';
import { ExaminerPersonalCommitment } from '../../../domain/examiner-personal-commitment';
import {mapRow, PersonalCommitmentRow} from './row-mappers/personal-commitment-row-mapper';
import { query } from '../../../../../common/framework/mysql/database';
import { info, customDurationMetric } from '@dvsa/mes-microservice-common/application/utils/logger';

/**
 * Get all personal commitments, for the specified time window.
 * @param connectionPool The MySQL connection pool to use
 * @param startDate The start date of the time window
 * @param durationDays The duration of the time window, in days
 * @returns The personal commitments
 */
export const getPersonalCommitments = async (connectionPool: mysql.Pool, startDate: Date, durationDays: number):
Promise<ExaminerPersonalCommitment[]> => {
  const windowStart = moment(startDate);
  const windowEnd = windowStart.clone().add({ days: durationDays }).subtract({ seconds: 1 });
  const sqlDateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
  const windowStartString = windowStart.format(sqlDateTimeFormat);
  const windowEndString = windowEnd.format(sqlDateTimeFormat);

  info(`Running query for personal commitments from ${windowStartString} to ${windowEndString}...`);
  const start = new Date();
  const [res] = await query(
    connectionPool,
    `
    select e.individual_id, cas.slot_id, pc.commitment_id, pc.non_test_activity_code, reason.reason_desc
    from EXAMINER e
      join PERSONAL_COMMITMENT pc on e.individual_id = pc.individual_id
      join NON_TEST_ACTIVITY_REASON reason on pc.non_test_activity_code = reason.non_test_activity_code
      join COMMITMENT_AFFECTED_SLOT cas on cas.commitment_id = pc.commitment_id
    where IFNULL(e.grade_code, 'ZZZ') != 'DELE'
    and (
      DATE(pc.start_date_time) between ? and ?
      or DATE(pc.end_date_time) between ? and ?
    )
    and exists (
        select end_date
        from EXAMINER_STATUS es
        where es.individual_id = e.individual_id
        and IFNULL(es.end_date, '4000-01-01') > ?
    )
    `,
    [windowStartString, windowEndString, windowStartString, windowEndString, windowStartString],
  );

  const results = (res as PersonalCommitmentRow[]).map(mapRow);
  const end = new Date();
  info(`${results.length} personal commitments loaded and mapped`);
  customDurationMetric('PersonalCommitmentsQuery', 'Time taken querying personal commitments, in seconds', start, end);
  return results;
};
