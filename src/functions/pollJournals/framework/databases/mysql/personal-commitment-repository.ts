import * as mysql from 'mysql2';
import * as moment from 'moment';
import { mapRow, PersonalCommitmentRow } from './row-mappers/personal-commitment-row-mapper';
import { poolQuery } from '../../../../../common/framework/mysql/database';
import { info, customDurationMetric } from '@dvsa/mes-microservice-common/application/utils/logger';
import { ExaminerPersonalCommitment } from '../../../domain/examiner-personal-commitment';

/**
 * Get all personal commitments, for the specified time window.
 * @param connectionPool The MySQL connection pool to use
 * @param startDate The start date of the time window
 * @param durationDays The duration of the time window, in days
 * @returns The personal commitments
 */
export const getPersonalCommitments = async (connectionPool: mysql.Pool, startDate: Date, durationDays: number):
Promise<ExaminerPersonalCommitment[]> => {
  if (process.env.IS_DEV) {
    return [
      {
        examinerId: 1,
        personalCommitment: {
          commitmentId: 1,
          slotId: 1,
          activityCode: '1',
          activityDescription: 'Personal Commitment 1',
        },
      },
      {
        examinerId: 3,
        personalCommitment: {
          commitmentId: 2,
          slotId: 2,
          activityCode: '2',
          activityDescription: 'Personal Commitment 2',
        },
      },
      {
        examinerId: 5,
        personalCommitment: {
          commitmentId: 3,
          slotId: 3,
          activityCode: '3',
          activityDescription: 'Personal Commitment 3',
        },
      },
      {
        examinerId: 7,
        personalCommitment: {
          commitmentId: 4,
          slotId: 4,
          activityCode: '4',
          activityDescription: 'Personal Commitment 4',
        },
      },
    ];
  }
  const windowStart = moment(startDate);
  const windowEnd = windowStart.clone().add({days: durationDays}).subtract({seconds: 1});
  const sqlDateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
  const windowStartString = windowStart.format(sqlDateTimeFormat);
  const windowEndString = windowEnd.format(sqlDateTimeFormat);

  info(`Running query for personal commitments from ${windowStartString} to ${windowEndString}...`);
  const start = new Date();
  const res: PersonalCommitmentRow[] = await poolQuery(
    connectionPool,
    mysql.format(
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
    )
  );
  const results = res.map(mapRow);
  const end = new Date();
  info(`${results.length} personal commitments loaded and mapped`);
  customDurationMetric('PersonalCommitmentsQuery', 'Time taken querying personal commitments, in seconds', start, end);
  return results;
};
