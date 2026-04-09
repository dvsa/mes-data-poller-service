import { It, Mock, Times } from 'typemoq';
import * as journalRepository from '../../databases/dynamodb/journal-repository';
import { getInactiveExaminers } from '../get-inactive-examiners';

describe('getInactiveExaminers module', () => {
  const moqInactiveJournals = Mock.ofInstance(journalRepository.identifyInactiveJournals);
  const moqRemoveInactiveJournals = Mock.ofInstance(journalRepository.removeInactiveJournals);

  beforeEach(() => {
    moqInactiveJournals.reset();
    moqRemoveInactiveJournals.reset();

    spyOn(journalRepository, 'identifyInactiveJournals').and.callFake(moqInactiveJournals.object);
    spyOn(journalRepository, 'removeInactiveJournals').and.callFake(moqRemoveInactiveJournals.object);
  });

  describe('getInactiveExaminers', () => {
    it('should call identify followed by remove of journals', async () => {
      const mockInactiveStaffNumbers = ['123', '456'];

      // Set up the mock to return the expected value
      moqInactiveJournals.setup((x) => x()).returns(async () => mockInactiveStaffNumbers);

      await getInactiveExaminers();

      // Verify the methods were called with the correct arguments
      moqInactiveJournals.verify((x) => x(), Times.once());
      moqRemoveInactiveJournals.verify((x) => x(It.isValue(mockInactiveStaffNumbers)), Times.once());
    });
  });
});
