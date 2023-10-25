import * as mysql from 'mysql2';
import { config } from "../config/config";
import { certificate } from "../../certs/ssl_profiles";

export const query = async (
  connection: mysql.Connection | mysql.Pool,
  sql: string
): Promise<any> => {
  let queryResult;
  try {
    const [rows] = await connection.promise().query(
      sql,
    );
    queryResult = rows;
  } catch (err) {
    throw err;
  } finally {
    connection.end();
  }

  return queryResult;
};


export const getConnection = (): mysql.Connection => {
  const configuration = config();
  const connection = mysql.createConnection({
    host: configuration.tarsReplicaDatabaseHostname,
    database: configuration.tarsReplicaDatabaseName,
    user: configuration.tarsReplicaDatabaseUsername,
    password: configuration.tarsReplicaDatabasePassword,
    charset: 'UTF8_GENERAL_CI',
    ssl: process.env.TESTING_MODE ? null : certificate,
    authPlugins: {
      mysql_clear_password: () => () => Buffer.from(`${configuration.tarsReplicaDatabasePassword}\0`),
    },
  });
  return connection;
};