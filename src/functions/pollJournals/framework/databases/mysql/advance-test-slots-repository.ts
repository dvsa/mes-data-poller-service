import * as mysql from 'mysql2';
import * as moment from 'moment';
import {AdvanceTestSlotRow, mapRow} from './row-mappers/advance-test-slot-row-mapper';
import {poolQuery, query} from '../../../../../common/framework/mysql/database';
import {info, customDurationMetric} from '@dvsa/mes-microservice-common/application/utils/logger';
import {ExaminerAdvanceTestSlot} from '../../../domain/examiner-advance-test-slot';
import {formatDateToStartTime} from '../../../application/formatters/date-formatter';

/**
 * Get all test slots in the advanced time window.
 * @param connectionPool The MySQL connection pool to use
 * @param startDate The start date of the time window
 * @param nextWorkingDay The date of the next working day
 * @param daysRange The range of days to include in the time window
 * @returns The advanced test slots
 */
export const getAdvanceTestSlots = async (
  connectionPool: mysql.Pool, startDate: Date, nextWorkingDay: Date,
  daysRange: number): Promise<ExaminerAdvanceTestSlot[]> => {
  if (process.env.IS_DEV) {
    return [
      {
        examinerId: 1,
        advanceTestSlot: {
          slotDetail: {
            slotId: 200,
            start: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
            duration: 57,
          },
          testCentre: {
            centreId: 1,
            centreName: 'Test Centre 1',
            costCode: 'TC1',
          },
          vehicleTypeCode: 'VT1',
        },
      },
      {
        examinerId: 3,
        advanceTestSlot: {
          slotDetail: {
            slotId: 201,
            start: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
            duration: 57,
          },
          testCentre: {
            centreId: 2,
            centreName: 'Test Centre 2',
            costCode: 'TC2',
          },
          vehicleTypeCode: 'VT2',
        },
      },
      {
        examinerId: 5,
        advanceTestSlot: {
          slotDetail: {
            slotId: 202,
            start: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
            duration: 57,
          },
          testCentre: {
            centreId: 3,
            centreName: 'Test Centre 3',
            costCode: 'TC3',
          },
          vehicleTypeCode: 'VT3',
        },
      },
      {
        examinerId: 7,
        advanceTestSlot: {
          slotDetail: {
            slotId: 203,
            start: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
            duration: 57,
          },
          testCentre: {
            centreId: 4,
            centreName: 'Test Centre 4',
            costCode: 'TC4',
          },
          vehicleTypeCode: 'VT4',
        },
      },
    ];
  }

  const sqlYearFormat = 'YYYY-MM-DD';
  const windowStart = moment(nextWorkingDay).add({days: 1}).format(sqlYearFormat);
  const windowEnd = moment(startDate).add({days: (daysRange - 1)}).format(sqlYearFormat);

  info(`running advanced test slots query from ${windowStart} to ${windowEnd}...`);
  const start = new Date();
  const res = await poolQuery(
    connectionPool,
    mysql.format(
      `
                select w.individual_id,
                       w.slot_id,
                       w.start_time,
                       w.minutes,
                       w.tc_id,
                       tcn.tc_name,
                       tc.tc_cost_centre_code,
                       vst.vehicle_type_code
                from WORK_SCHEDULE_SLOTS w
                         join TEST_CENTRE tc on w.tc_id = tc.tc_id
                         join TEST_CENTRE_NAME tcn on w.tc_id = tcn.tc_id
                         join VEHICLE_SLOT_TYPE vst on w.vst_code = vst.vst_code
                where w.programme_date between ? and ?
                  and w.examiner_end_date > ?
            `,
      [windowStart, windowEnd, windowStart],
    ),
  );
  const results = (res as AdvanceTestSlotRow[]).map(mapRow);
  const end = new Date();
  info(`${results.length} advance test slots loaded and mapped`);
  customDurationMetric('AdvanceTestSlotsQuery', 'Time taken querying advance test slots, in seconds', start, end);
  return results;
};
