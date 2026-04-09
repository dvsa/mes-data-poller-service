import { info } from '@dvsa/mes-microservice-common/application/utils/logger';
import * as journalRepository from '../../databases/dynamodb/journal-repository';
import { getJournalDetails } from '../get-journal-details';

describe('getJournalDetails', () => {
  let mockGetJournalDetails: jasmine.Spy;
  let mockLoggerInfo: jasmine.Spy;

  beforeEach(() => {
    mockGetJournalDetails = spyOn(journalRepository as any, 'getJournalDetails'); // Cast to `any` to avoid type issues
    mockLoggerInfo = spyOn(info as any, 'call').and.callThrough();
  });

  it('retrieves journal details within the specified time window', async () => {
    const startTime = new Date('2023-01-01T00:00:00Z');
    const startDate = new Date('2023-01-01T00:00:00Z');
    const journalStartDate = new Date('2022-12-18T00:00:00Z');
    const mockJournalDetails = [{ examinerId: '1', journalData: {} }];

    mockGetJournalDetails.and.returnValue(Promise.resolve(mockJournalDetails));

    const result = await getJournalDetails(startTime, startDate, journalStartDate);

    expect(mockGetJournalDetails).toHaveBeenCalledWith(startTime, startDate, journalStartDate);
    expect(result).toEqual(mockJournalDetails as any); // Cast to `any` to match the expected type
  });

  it('logs an error if getJournalDetails throws an exception', async () => {
    const startTime = new Date('2023-01-01T00:00:00Z');
    const startDate = new Date('2023-01-01T00:00:00Z');
    const journalStartDate = new Date('2022-12-18T00:00:00Z');
    const errorMessage = 'Database error';

    mockGetJournalDetails.and.throwError(errorMessage);

    await expectAsync(getJournalDetails(startTime, startDate, journalStartDate)).toBeRejectedWithError(errorMessage);
    expect(mockLoggerInfo).toHaveBeenCalledWith(jasmine.stringMatching(/ERROR/));
  });

  it('returns an empty array if no journal details are found', async () => {
    const startTime = new Date('2023-01-01T00:00:00Z');
    const startDate = new Date('2023-01-01T00:00:00Z');
    const journalStartDate = new Date('2022-12-18T00:00:00Z');

    mockGetJournalDetails.and.returnValue(Promise.resolve([]));

    const result = await getJournalDetails(startTime, startDate, journalStartDate);

    expect(mockGetJournalDetails).toHaveBeenCalledWith(startTime, startDate, journalStartDate);
    expect(result).toEqual([] as any); // Cast to `any` to match the expected type
  });
});
