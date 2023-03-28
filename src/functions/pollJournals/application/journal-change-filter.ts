import { JournalRecord } from '../domain/journal-record';
import { getStaffNumbersWithHashes } from '../framework/repo/dynamodb/journal-repository';
import { get } from 'lodash';

export const filterChangedJournals = async (allJournals: JournalRecord[], startTime: Date):
Promise<JournalRecord[]> => {
  const staffNumbersAndHashes = await getStaffNumbersWithHashes(startTime);
  const staffNumberHashMappings = createStaffNumberHashLookup(staffNumbersAndHashes);

  const filteredJournals = allJournals.filter((journal) => {
    const cachedHashForJournal = get(staffNumberHashMappings, journal.staffNumber);
    const haveCachedHashForJournal = !!cachedHashForJournal;
    const hashesMatch = journal.hash === cachedHashForJournal;
    return !haveCachedHashForJournal || !hashesMatch;
  });
  return filteredJournals;
};

const createStaffNumberHashLookup = (staffNumbersAndHashes: Partial<JournalRecord>[]) => {
  return staffNumbersAndHashes.reduce(
    (mappings, journalMeta) => {
      if (journalMeta.staffNumber && journalMeta.hash) {
        return { ...mappings, [journalMeta.staffNumber]: journalMeta.hash };
      }
      return mappings;
    },
    {},
  );
};
