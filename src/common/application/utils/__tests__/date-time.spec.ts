import { DateTime, Duration } from '../date-time';

describe('DateTime', () => {
  const today = new DateTime();
  const yesterday = new DateTime().add(-1, Duration.DAY);
  const tomorrow = new DateTime().add(1, Duration.DAY);

  it('should correctly calculate days difference using a string', () => {
    expect(today.daysDiff(today.format('YYYY-MM-DD'))).toBe(0);
    expect(today.daysDiff(tomorrow.format('YYYY-MM-DD'))).toBe(1);
    expect(today.daysDiff(yesterday.format('YYYY-MM-DD'))).toBe(-1);
  });

  it('should correctly calculate days difference using a date', () => {
    expect(today.daysDiff(new Date())).toBe(0);
    expect(today.daysDiff(new Date(tomorrow.format('YYYY-MM-DD')))).toBe(1);
    expect(today.daysDiff(new Date(yesterday.format('YYYY-MM-DD')))).toBe(-1);
  });
});
