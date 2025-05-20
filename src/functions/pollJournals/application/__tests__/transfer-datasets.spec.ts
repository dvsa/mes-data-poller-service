import * as moment from 'moment';
import { transferDatasets } from '../transfer-datasets';
import * as journalDetailsRepo from '../../framework/repositories/get-journal-details';
import * as config from '../../../../common/framework/config/config';

describe('transferDatasets', () => {
  let mockGetJournalDetails: jasmine.Spy;
  let mockGetInactiveExaminers: jasmine.Spy;
  let mockConfig: jasmine.Spy;

  beforeEach(() => {
    mockGetJournalDetails = spyOn(journalDetailsRepo, 'getJournalDetails');
    mockConfig = spyOn(config, 'config');
  });

  it('calls getJournalDetails with correct values when timeTravelDate is set', async () => {
    const startTime = new Date();
    const timeTravelDate = '2023-01-01';
    mockConfig.and.returnValue({
      timeTravelDate,
      isOffline: false,
      dynamodbTableName: '',
      tarsReplicaDatabaseHostname: '',
      tarsReplicaDatabaseName: '',
      tarsReplicaDatabaseUsername: '',
      tarsReplicaDatabasePassword: '',
    });

    const startDate = moment(timeTravelDate).toDate();
    const journalStartDate = moment(timeTravelDate).subtract(14, 'days').toDate();

    await transferDatasets(startTime);

    expect(mockGetJournalDetails).toHaveBeenCalledWith(startTime, startDate, journalStartDate);
  });

  it('calls getJournalDetails with correct values when timeTravelDate is not set', async () => {
    const startTime = new Date();
    mockConfig.and.returnValue({
      timeTravelDate: null,
      isOffline: false,
      dynamodbTableName: '',
      tarsReplicaDatabaseHostname: '',
      tarsReplicaDatabaseName: '',
      tarsReplicaDatabaseUsername: '',
      tarsReplicaDatabasePassword: '',
    });

    const startDate = moment().startOf('day').toDate();
    const journalStartDate = moment(startDate).subtract(14, 'days').startOf('day').toDate();

    await transferDatasets(startTime);

    expect(mockGetJournalDetails).toHaveBeenCalledWith(startTime, startDate, journalStartDate);
  });
});
