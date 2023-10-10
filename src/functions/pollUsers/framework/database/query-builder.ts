import * as path from 'path';
import MyBatis from 'mybatis-mapper';

export const getCategoriesWithUniversalPermissionsQuery = (): string => {
  try {
    MyBatis.createMapper([path.resolve(__dirname, '../mappers/users-mapper.xml')]);

    const query = MyBatis.getStatement(
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
