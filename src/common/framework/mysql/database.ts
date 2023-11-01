import * as mysql from 'mysql2';
import { config } from '../config/config';
import { certificate } from '../../certs/ssl_profiles';

/**
 * Execute a single query and close connection
 * @param connection
 * @param sql
 */
export const query = async (
  connection: mysql.Connection,
  sql: string
): Promise<any> => {
  let queryResult;
  try {
    const [rows] = await connection.promise().query(
      sql,
    );
    queryResult = rows;
  } catch (err) {
    console.log('err', err);
    throw err;
  } finally {
    connection.end();
  }
  return queryResult;
};


/**
 * Establish a connection to a database to facilitate a single query
 */
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

export const poolQuery = async (
  connection: mysql.Pool,
  sql: string
): Promise<any> => {
  let queryResult;
  try {
    const [rows] = await connection.promise().query(
      sql,
    );
    queryResult = rows;
  } catch (err) {
    console.log('err', err);
    throw err;
  }
  return queryResult;
};

/**
 * Establish a connection to a database to facilitate multiple queries
 */
export const getConnectionPool = (): mysql.Pool => {
  const configuration = config();
  return mysql.createPool({
    host: configuration.tarsReplicaDatabaseHostname,
    database: configuration.tarsReplicaDatabaseName,
    user: configuration.tarsReplicaDatabaseUsername,
    password: configuration.tarsReplicaDatabasePassword,
    charset: 'UTF8_GENERAL_CI',
    ssl: process.env.TESTING_MODE ? null : certificate,
    authPlugins: {
      mysql_clear_password: () => () => Buffer.from(`${configuration.tarsReplicaDatabasePassword}\0`),
    },
    connectionLimit: 50,
  });
};
