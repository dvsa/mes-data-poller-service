import { getInactiveExaminers } from '../get-inactive-examiners';
import * as journalRepository from '../../databases/dynamodb/journal-repository';
import { info } from '@dvsa/mes-microservice-common/application/utils/logger';

describe('getInactiveExaminers', () => {
  let mockIdentifyInactiveJournals: jasmine.Spy;
  let mockRemoveInactiveJournals: jasmine.Spy;
  let mockLoggerInfo: jasmine.Spy;

  beforeEach(() => {
    mockIdentifyInactiveJournals = spyOn(journalRepository, 'identifyInactiveJournals');
    mockRemoveInactiveJournals = spyOn(journalRepository, 'removeInactiveJournals');
    mockLoggerInfo = spyOn(info as any, 'call').and.callThrough();
  });

  it('logs the start and end of the cleanup process', async () => {
    mockIdentifyInactiveJournals.and.returnValue([]);
    mockRemoveInactiveJournals.and.returnValue(Promise.resolve());

    await getInactiveExaminers();

    expect(mockLoggerInfo).toHaveBeenCalledWith(jasmine.stringMatching(/STARTING INACTIVE EXAMINERS CLEANUP/));
    expect(mockLoggerInfo).toHaveBeenCalledWith(jasmine.stringMatching(/FINISHED INACTIVE EXAMINERS CLEANUP/));
  });

  it('retrieves inactive journals and removes them', async () => {
    const inactiveStaffNumbers = ['1', '2'];
    mockIdentifyInactiveJournals.and.returnValue(inactiveStaffNumbers);
    mockRemoveInactiveJournals.and.returnValue(Promise.resolve());

    await getInactiveExaminers();

    expect(mockIdentifyInactiveJournals).toHaveBeenCalled();
    expect(mockRemoveInactiveJournals).toHaveBeenCalledWith(inactiveStaffNumbers);
  });

  it('does not call removeInactiveJournals if no inactive journals are found', async () => {
    mockIdentifyInactiveJournals.and.returnValue([]);
    mockRemoveInactiveJournals.and.returnValue(Promise.resolve());

    await getInactiveExaminers();

    expect(mockIdentifyInactiveJournals).toHaveBeenCalled();
    expect(mockRemoveInactiveJournals).not.toHaveBeenCalled();
  });

  it('throws an error if identifyInactiveJournals fails', async () => {
    mockIdentifyInactiveJournals.and.throwError('Database error');

    await expectAsync(getInactiveExaminers()).toBeRejectedWithError('Database error');
  });

  it('throws an error if removeInactiveJournals fails', async () => {
    const inactiveStaffNumbers = ['1', '2'];
    mockIdentifyInactiveJournals.and.returnValue(inactiveStaffNumbers);
    mockRemoveInactiveJournals.and.throwError('Database error');

    await expectAsync(getInactiveExaminers()).toBeRejectedWithError('Database error');
  });
});
