import * as mysql from 'mysql2';

export const query = async (
  connection: mysql.Connection | mysql.Pool,
  sql: string,
  args: any = [],
) => await connection.promise().query(sql, args);
