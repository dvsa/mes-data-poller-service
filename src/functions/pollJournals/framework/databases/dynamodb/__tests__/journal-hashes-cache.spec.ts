import { JournalHashesCache } from '../journal-hashes-cache';
import { JournalRecord } from '../../../../domain/journal-record';
import moment = require('moment');

describe('JournalHashesCache', () => {

  const pollerFrequency = 60;
  const startTime = moment('2019-01-01 10:30:00.000');
  const tooEarly = startTime.clone().add({ seconds: pollerFrequency / 2 }); // before 20% leniency
  const minLeniency = startTime.clone().add({ seconds: pollerFrequency * 0.8 }); // at min 20% leniency
  const justRight = startTime.clone().add({ seconds: pollerFrequency });
  const maxLeniency = startTime.clone().add({ seconds: pollerFrequency * 1.2 }); // at max 20% leniency
  const tooLate = startTime.clone().add({ seconds: pollerFrequency * 2 }); // after 20% leniency

  const subsequentStartTime = moment('2019-01-01 10:31:00.000');
  const subsequentInTime = subsequentStartTime.clone().add({ seconds: pollerFrequency });
  const subsequentTooLate = subsequentStartTime.clone().add({ seconds: pollerFrequency * 2 });

  const hash1 = {
    staffNumber: '12345',
    hash: 'aaabbb',
  } as Partial<JournalRecord>;

  const hash2 = {
    staffNumber: '67890',
    hash: 'cccddd',
  } as Partial<JournalRecord>;

  const hash2Updated = {
    staffNumber: hash2.staffNumber,
    hash: 'eeefff',
  } as Partial<JournalRecord>;

  let cache: JournalHashesCache;

  beforeEach(() => {
    cache = new JournalHashesCache(pollerFrequency);
  });

  describe('isValid()', () => {
    it('empty cache should be invalid', () => {
      expect(cache.isValid(new Date())).toBe(false);
    });

    it('cache populated too early should be invalid', () => {
      cache.clearAndPopulate([], startTime.toDate());
      expect(cache.isValid(tooEarly.toDate())).toBe(false);
    });

    it('cache populated early (min leniency) should be valid', () => {
      cache.clearAndPopulate([], startTime.toDate());
      expect(cache.isValid(minLeniency.toDate())).toBe(true);
    });

    it('cache populated within poller frquency should be valid', () => {
      cache.clearAndPopulate([], startTime.toDate());
      expect(cache.isValid(justRight.toDate())).toBe(true);
    });

    it('cache populated late (max leniency) should be valid', () => {
      cache.clearAndPopulate([], startTime.toDate());
      expect(cache.isValid(maxLeniency.toDate())).toBe(true);
    });

    it('cache populated too late should be invalid', () => {
      cache.clearAndPopulate([], startTime.toDate());
      expect(cache.isValid(tooLate.toDate())).toBe(false);
    });

    it('valid cache updated too late should become invalid', () => {
      cache.clearAndPopulate([], startTime.toDate());
      expect(cache.isValid(justRight.toDate())).toBe(true); // starts valid

      cache.update(subsequentStartTime.toDate(), []);
      expect(cache.isValid(subsequentTooLate.toDate())).toBe(false); // becomes invalid
    });

    it('invalid cache updated in time should become valid', () => {
      cache.clearAndPopulate([], startTime.toDate());
      expect(cache.isValid(tooLate.toDate())).toBe(false); // starts invalid

      cache.update(subsequentStartTime.toDate(), []);
      expect(cache.isValid(subsequentInTime.toDate())).toBe(true); // becomes valid
    });
  });

  describe('get()', () => {
    it('cache is empty if never populated', () => {
      expect(cache.get()).toEqual([]);
    });

    it('returns cached data when populated', () => {
      cache.clearAndPopulate([hash1, hash2], startTime.toDate());
      expect(cache.get()).toEqual([hash1, hash2]);
    });

    it('returns new data when updated', () => {
      cache.clearAndPopulate([hash1, hash2], startTime.toDate());
      cache.update(justRight.toDate(), [hash2Updated]);
      expect(cache.get()).toEqual([hash1, hash2Updated]); // hash2 is updated
    });
  });

  describe('clearAndPopulate()', () => {
    it('clears previous data', () => {
      cache.clearAndPopulate([hash1, hash2], startTime.toDate());
      cache.clearAndPopulate([hash1], startTime.toDate());
      expect(cache.get()).toEqual([hash1]); // no hash2
    });
  });

  describe('update()', () => {
    it('retains previous data', () => {
      cache.clearAndPopulate([hash1, hash2], startTime.toDate());
      cache.update(justRight.toDate(), [hash2Updated]);
      expect(cache.get()).toEqual([hash1, hash2Updated]); // hash1 retained, hash2 is updated
    });
  });
});
