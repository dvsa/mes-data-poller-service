import * as path from 'path';
import { createMapper, getStatement } from "mybatis-mapper";

export const getCategoriesWithUniversalPermissionsQuery = (): string => {
  try {
    console.log('hello');
    createMapper([path.resolve(__dirname, '../mappers/users-mapper.xml')])
    const query = getStatement(
      'Users',
      'CategoriesWithUniversalPermissions',
      {},
      { language: 'sql' }
    );
    console.log(query);
    return query;
  } catch (error) {
    console.error('Error generating query:', error);
    throw error;
  }
};