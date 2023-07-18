import { trimLeadingZeroes } from '../trimLeadingZeros';

describe('trimLeadingZeroes', () => {
  it('should remove leading zeroes from a staff number', () => {
    const result = trimLeadingZeroes('00123');
    expect(result).toEqual('123');
  });

  it('should return null if the input is not a valid number', () => {
    const result = trimLeadingZeroes('abc');
    expect(result).toBeNull();
  });

  it('should return the input string if it contains no leading zeroes', () => {
    const result = trimLeadingZeroes('123');
    expect(result).toEqual('123');
  });

  it('should return 0 if the input string is 0', () => {
    const result = trimLeadingZeroes('0');
    expect(result).toEqual('0');
  });
});
