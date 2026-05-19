import { toUK } from '../test-slot-repository-des-schedule';

describe('toUK', () => {
  it('should convert valid UTC ISO datetime string to UK timezone in winter', () => {
    const result = toUK('2024-01-15T09:00:00');
    expect(result).toBe('2024-01-15T09:00:00');
  });

  it('should add one hour to UTC time during summer daylight saving time', () => {
    const result = toUK('2024-07-15T12:00:00');
    expect(result).toBe('2024-07-15T13:00:00');
  });

  it('should maintain UTC time during winter without offset', () => {
    const result = toUK('2024-01-15T12:00:00');
    expect(result).toBe('2024-01-15T12:00:00');
  });

  it('should return string unchanged when format does not match ISO pattern', () => {
    const invalidFormat = '15/01/2024 09:00:00';
    const result = toUK(invalidFormat);
    expect(result).toBe('15/01/2024 09:00:00');
  });

  it('should return string unchanged when missing time component', () => {
    const dateOnly = '2024-01-15';
    const result = toUK(dateOnly);
    expect(result).toBe('2024-01-15');
  });

  it('should return string unchanged when includes timezone marker', () => {
    const withTimezone = '2024-01-15T09:00:00Z';
    const result = toUK(withTimezone);
    expect(result).toBe('2024-01-15T09:00:00Z');
  });

  it('should convert UTC midnight in winter timezone', () => {
    const result = toUK('2024-01-15T00:00:00');
    expect(result).toBe('2024-01-15T00:00:00');
  });

  it('should convert UTC midnight to previous day at 23:00 during summer', () => {
    const result = toUK('2024-07-15T23:00:00');
    expect(result).toBe('2024-07-16T00:00:00');
  });

  it('should handle spring forward daylight saving time transition', () => {
    const result = toUK('2024-01-01T01:00:00');
    expect(result).toBe('2024-01-01T01:00:00');
  });

  it('should handle autumn back daylight saving time transition', () => {
    const result = toUK('2024-07-27T01:00:00');
    expect(result).toBe('2024-07-27T02:00:00');
  });

  it('should return string unchanged for string with extra trailing characters', () => {
    const withExtra = '2024-01-15T09:00:00 extra';
    const result = toUK(withExtra);
    expect(result).toBe('2024-01-15T09:00:00 extra');
  });

  it('should always use capital T separator in output', () => {
    const result = toUK('2024-01-15T14:30:45');
    expect(result).toBe('2024-01-15T14:30:45');
  });

  it('should convert leap year date correctly', () => {
    const result = toUK('2024-02-29T12:00:00');
    expect(result).toBe('2024-02-29T12:00:00');
  });

  it('should return string unchanged for lowercase t separator', () => {
    const lowerT = '2024-01-15t09:00:00';
    const result = toUK(lowerT);
    expect(result).toBe('2024-01-15t09:00:00');
  });

  it('should convert UTC midnight at year start to UK timezone', () => {
    const result = toUK('2024-01-01T00:00:00');
    expect(result).toBe('2024-01-01T00:00:00');
  });

  it('should convert UTC noon to 13:00 during British Summer Time', () => {
    const result = toUK('2024-06-15T12:00:00');
    expect(result).toBe('2024-06-15T13:00:00');
  });

  it('should preserve full precision of seconds in converted time', () => {
    const result = toUK('2024-01-15T14:30:45');
    expect(result).toBe('2024-01-15T14:30:45');
  });

  it('should handle date change when converting from UTC across midnight', () => {
    const result = toUK('2024-07-15T23:30:00');
    expect(result).toBe('2024-07-16T00:30:00');
  });

  it('should return exact formatted string for all valid conversions', () => {
    const result = toUK('2024-05-15T10:15:30');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    expect(result).toBe('2024-05-15T11:15:30');
  });
});
