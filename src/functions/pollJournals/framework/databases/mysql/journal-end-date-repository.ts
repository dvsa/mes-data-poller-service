import { info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { get } from 'lodash';
import * as moment from 'moment';
import * as mysql from 'mysql2';
import { poolQuery } from '../../../../../common/framework/mysql/database';

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
  if (process.env.USE_MOCK_TARS_DATA === 'true') {
    return moment(startDate).add(1, 'days').toDate();
  }
  const sqlYearFormat = 'YYYY-MM-DD';
  const windowStart = moment(startDate).format(sqlYearFormat);

  info(`running journal end date query starting on ${windowStart}`);
  const res: JournalEndDateRow[] = await poolQuery(
    connectionPool,
    mysql.format('select tarsreplica.getJournalEndDate(1, ?) as next_working_day', [windowStart])
  );
  return res.map((row: JournalEndDateRow) => row.next_working_day as Date)[0];
};

export const getJournalEndDate = (): Date => {
  const numberOfFutureDays: number = parseInt(get(process, 'env.FUTURE_JOURNAL_DAYS', null), 10);
  if (numberOfFutureDays > 0) {
    return moment(new Date()).add(numberOfFutureDays, 'days').toDate();
  }
  return null;
};
