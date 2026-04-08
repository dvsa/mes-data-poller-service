import { extractDateFromDateTime, extractTimeFromDateTime, formatDateToStartTime } from '../formatters/date-formatter';

describe('dateFormatter', () => {
  describe('formatDateToStartTime', () => {
    it('Output the correct format on a valid date', () => {
      const result = formatDateToStartTime(new Date('2019-02-19 09:30:01'));
      expect(result).toBe('2019-02-19T09:30:01');
    });

    it('should handle nulls at runtime', () => {
      const result = formatDateToStartTime(<Date>(<unknown>null));
      expect(result).toBe('');
    });
  });

  describe('extractTimeFromDateTime', () => {
    it('should extract the time part of a real date object', () => {
      const result = extractTimeFromDateTime(new Date('2019-02-19 09:30:01'));
      expect(result).toBe('09:30:01');
    });
  });

  describe('extractDateFromDateTime', () => {
    it('should extract the date part of a real date object', () => {
      const result = extractDateFromDateTime(new Date('2019-02-19 09:30:01'));
      expect(result).toBe('19/02/2019');
    });
  });
});
