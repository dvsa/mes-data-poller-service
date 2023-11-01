import * as moment from 'moment';
import { config } from '../../../common/framework/config/config';
import { getJournalDetails } from '../framework/repositories/get-journal-details';

export const transferDatasets = async (startTime: Date): Promise<void> => {


  let startDate: Date;

  if (config().timeTravelDate != null) {
    // Assumes fixed format for TIME_TRAVEL_DATE, e.g. 2019-03-13
    startDate = moment(config().timeTravelDate).toDate();
  } else {
    // time window starts at the beginning of the initial day
    startDate = moment().startOf('day').toDate();
  }

  const journalDaysPast: number = 14;
  let journalStartDate: Date;

  if (config().timeTravelDate != null) {
    // Assumes fixed format for TIME_TRAVEL_DATE, e.g. 2019-03-13
    journalStartDate = moment(config().timeTravelDate).subtract(journalDaysPast, 'days').toDate();
  } else {
    // time window starts at the beginning of the initial day
    journalStartDate = moment(startDate).subtract(journalDaysPast, 'days').startOf('day').toDate();
  }

  await getJournalDetails(startTime, startDate, journalStartDate);

};
