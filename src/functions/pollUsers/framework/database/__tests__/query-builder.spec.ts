import {getCategoriesWithUniversalPermissionsQuery} from '../query-builder';

describe('getCategoriesWithUniversalPermissionsQuery', () => {
  let result = '';

  beforeEach(() => {
    result = getCategoriesWithUniversalPermissionsQuery().replace(/\s+/g, ' ');
  });

  it('should call through to DES_TEST_CRITERIA table', () => {
    expect(result).toMatch(/FROM DES_TEST_CRITERIA/);
  });
});
