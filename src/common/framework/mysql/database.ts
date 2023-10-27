import * as mysql from 'mysql2';

export const query = async <T>(
  connection: mysql.Connection | mysql.Pool,
  sql: string, args?: any,
): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    connection.query(sql, args, (err, rows: mysql.RowDataPacket[]) => {
      if (err) {
        reject(err);
      }
      resolve(rows as T[]);
    });
  });
};
