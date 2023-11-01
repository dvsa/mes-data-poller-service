import { getJournalEndDate } from '../journal-end-date-repository';

describe('getJournalEndDate', () => {
  beforeAll(() => {
    jasmine.clock().install();
    const baseTime: Date = new Date('2020-01-01');
    jasmine.clock().mockDate(baseTime);
  });

  afterAll(() => {
    jasmine.clock().uninstall();
  });

  it('should return null if env variable does not exist', () => {
    const journalEndDate = getJournalEndDate();
    expect(journalEndDate).toEqual(null);
  });

  it('should return null if env variable returns 0', () => {
    process.env.FUTURE_JOURNAL_DAYS = '0';
    const journalEndDate = getJournalEndDate();
    expect(journalEndDate).toEqual(null);
    delete process.env.FUTURE_JOURNAL_DAYS;
  });

  it('should return current date plus n days if env variable exists', () => {
    process.env.FUTURE_JOURNAL_DAYS = '2';
    const expectedEndDate: Date = new Date('2020-01-03');
    const journalEndDate = getJournalEndDate();
    expect(journalEndDate).toEqual(expectedEndDate);
    delete process.env.FUTURE_JOURNAL_DAYS;
  });
});
