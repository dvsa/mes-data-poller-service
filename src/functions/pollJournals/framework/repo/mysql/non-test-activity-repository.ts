import * as mysql from 'mysql2';
import moment from 'moment';
import { ExaminerNonTestActivity } from '../../../domain/examiner-non-test-activity';
import { mapRow } from './row-mappers/non-test-activity-row-mapper';
import { query } from '../../../../../common/framework/mysql/database';
import { info, customDurationMetric } from '@dvsa/mes-microservice-common/application/utils/logger';

/**
 * Get all Non-test activities, within the specified time window.
 * @param connectionPool The MySQL connection pool to use
 * @param startDate The start date of the time window
 * @param endDate The end date of the time window
 * @returns The Non-test activities
 */
export const getNonTestActivities = async (connectionPool: mysql.Pool, startDate: Date, endDate: Date)
: Promise<ExaminerNonTestActivity[]> => {
  const sqlYearFormat = 'YYYY-MM-DD';
  const windowStart = moment(startDate).format(sqlYearFormat);
  const windowEnd = moment(endDate).format(sqlYearFormat);

  info(`running non test activity query between ${windowStart} and ${windowEnd}...`);
  const start = new Date();
  const res = await query(
    connectionPool,
    `
    select w.individual_id, w.slot_id, w.start_time, w.minutes, w.non_test_activity_code,
        reason.reason_desc, w.tc_id, tcn.tc_name, tc.tc_cost_centre_code
    from WORK_SCHEDULE_SLOTS w
      join NON_TEST_ACTIVITY_REASON reason on w.non_test_activity_code = reason.non_test_activity_code
      join TEST_CENTRE tc on w.tc_id = tc.tc_id
      join TEST_CENTRE_NAME tcn on w.tc_id = tcn.tc_id
      where w.examiner_end_date >= ?
      and w.programme_date between ? and ?
    `,
    [windowStart, windowStart, windowEnd],
  );
  const results = res.map(mapRow);
  const end = new Date();
  info(`${results.length} non test activities loaded and mapped`);
  customDurationMetric('NonTestActivitiesQuery', 'Time taken querying non test activities, in seconds', start, end);
  return results;
};
