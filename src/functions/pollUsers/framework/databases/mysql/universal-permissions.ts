import * as mysql from 'mysql2';

export const UniversalPermissionRecordSql = (): string => {
  const template =
    `
        SELECT test_category_ref,
               with_effect_from,
               with_effect_to
        FROM DES_TEST_CRITERIA
        WHERE examiner_staff_number IS NULL
    `;

  const args = [];

  return mysql.format(template, args);
};
