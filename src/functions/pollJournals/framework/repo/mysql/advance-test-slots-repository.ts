import * as mysql from 'mysql2';
import moment from 'moment';
import { ExaminerAdvanceTestSlot } from '../../../domain/examiner-advance-test-slot';
import { mapRow } from './row-mappers/advance-test-slot-row-mapper';
import { query } from '../../../../../common/framework/mysql/database';
import { info, customDurationMetric } from '@dvsa/mes-microservice-common/application/utils/logger';

/**
 * Get all test slots in the advanced time window.
 * @param connectionPool The MySQL connection pool to use
 * @param startDate The start date of the time window
 * @param nextWorkingDay The date of the next working day
 * @param daysRange The range of days to include in the time window
 * @returns The advanced test slots
 */
export const getAdvanceTestSlots = async (connectionPool: mysql.Pool, startDate: Date, nextWorkingDay: Date,
                                          daysRange: number): Promise<ExaminerAdvanceTestSlot[]> => {
  const sqlYearFormat = 'YYYY-MM-DD';
  const windowStart = moment(nextWorkingDay).add({ days: 1 }).format(sqlYearFormat);
  const windowEnd = moment(startDate).add({ days: (daysRange - 1) }).format(sqlYearFormat);

  info(`running advanced test slots query from ${windowStart} to ${windowEnd}...`);
  const start = new Date();
  const res = await query(
    connectionPool,
    `
    select w.individual_id, w.slot_id, w.start_time, w.minutes, w.tc_id, tcn.tc_name,
      tc.tc_cost_centre_code, vst.vehicle_type_code
    from WORK_SCHEDULE_SLOTS w
      join TEST_CENTRE tc on w.tc_id = tc.tc_id
      join TEST_CENTRE_NAME tcn on w.tc_id = tcn.tc_id
      join VEHICLE_SLOT_TYPE vst on w.vst_code = vst.vst_code
     where w.programme_date between ? and ?
     and w.examiner_end_date > ?
    `,
    [windowStart, windowEnd, windowStart],
  );
  const results = res.map(mapRow);
  const end = new Date();
  info(`${results.length} advance test slots loaded and mapped`);
  customDurationMetric('AdvanceTestSlotsQuery', 'Time taken querying advance test slots, in seconds', start, end);
  return results;
};
