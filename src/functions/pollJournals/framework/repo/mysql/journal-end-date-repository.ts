import * as mysql from 'mysql2';
import * as moment from 'moment';
import { query } from '../../../../../common/framework/mysql/database';
import { info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { get } from 'lodash';

// Typesafe result mapping for statement below
interface JournalEndDateRow {
  next_working_day: Date;
}

/**
 * Get the next working day, for the specified time window.
 * @param connectionPool The MySQL connection pool to use
 * @param startDate The start date of the time window
 * @returns The next working day
 */
export const getNextWorkingDay = async (connectionPool: mysql.Pool, startDate: Date): Promise<Date> => {
  const sqlYearFormat = 'YYYY-MM-DD';
  const windowStart = moment(startDate).format(sqlYearFormat);

  info(`running journal end date query starting on ${windowStart}...`);

  const [res] = await query(
    connectionPool,
    'select tarsreplica.getJournalEndDate(1, ?) as next_working_day',
    [windowStart],
  );

  return (res as JournalEndDateRow[]).map((row) => row.next_working_day as Date)[0];
};

export const getJournalEndDate = (): Date => {
  const numberOfFutureDays: number = parseInt(get(process, 'env.FUTURE_JOURNAL_DAYS', null), 10);
  if (numberOfFutureDays > 0) {
    return moment(new Date()).add(numberOfFutureDays, 'days').toDate();
  }
  return null;
};
