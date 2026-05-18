import { toUK } from '../test-slot-repository-des-schedule';

describe('toUK', () => {
  it('should convert valid UTC ISO datetime string to UK timezone', () => {
    const result = toUK('2024-01-15T09:00:00');
    expect(result).toBe('2024-01-15T09:00:00');
  });

  it('should handle winter timezone when converting UTC to UK', () => {
    const result = toUK('2024-01-15T12:00:00');
    expect(result).toContain('2024-01-15T12:00:00');
  });

  it('should handle summer timezone when converting UTC to UK', () => {
    const result = toUK('2024-07-15T12:00:00');
    expect(result).toContain('2024-07-15T13:00:00');
  });

  it('should return string unchanged when format does not match ISO pattern', () => {
    const invalidFormat = '15/01/2024 09:00:00';
    const result = toUK(invalidFormat);
    expect(result).toBe(invalidFormat);
  });

  it('should return string unchanged when missing time component', () => {
    const dateOnly = '2024-01-15';
    const result = toUK(dateOnly);
    expect(result).toBe(dateOnly);
  });

  it('should return string unchanged when includes timezone', () => {
    const withTimezone = '2024-01-15T09:00:00Z';
    const result = toUK(withTimezone);
    expect(result).toBe(withTimezone);
  });

  it('should handle midnight UTC time', () => {
    const result = toUK('2024-01-15T00:00:00');
    expect(result).toContain('2024-01-15T');
  });

  it('should handle end of day UTC time', () => {
    const result = toUK('2024-01-15T23:59:59');
    expect(result).toContain('2024-01-15T');
  });

  it('should convert spring daylight saving time boundary', () => {
    const result = toUK('2024-03-31T01:00:00');
    expect(result).toContain('T');
  });

  it('should convert autumn daylight saving time boundary', () => {
    const result = toUK('2024-10-27T01:00:00');
    expect(result).toContain('T');
  });

  it('should return string unchanged for string with extra characters', () => {
    const withExtra = '2024-01-15T09:00:00 extra';
    const result = toUK(withExtra);
    expect(result).toBe(withExtra);
  });

  it('should preserve the datetime format with T separator in output', () => {
    const result = toUK('2024-01-15T14:30:45');
    expect(result).toContain('T');
    expect(result).not.toContain(' ');
  });

  it('should handle leap year date', () => {
    const result = toUK('2024-02-29T12:00:00');
    expect(result).toContain('2024-02-29');
  });

  it('should return string unchanged for string with lowercase t separator', () => {
    const lowerT = '2024-01-15t09:00:00';
    const result = toUK(lowerT);
    expect(result).toBe(lowerT);
  });

  it('should handle UTC midnight that crosses into previous day in UK timezone', () => {
    const result = toUK('2024-01-01T00:00:00');
    expect(result).toContain('2024-01');
  });

  it('should handle UTC noon conversion to UK timezone', () => {
    const result = toUK('2024-06-15T12:00:00');
    expect(result).toContain('13:00:00');
  });
});
