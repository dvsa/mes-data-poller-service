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
export const getTARSConnection = (): mysql.Connection => {
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

export const getConnectionPool = (connectionMode: 'TARS'|'DSP'): mysql.Pool => {
  const configuration = config();

  let hostName: string = '';
  let databaseName: string = '';
  let databaseUserName: string = '';
  let databasePassword: string = '';

  switch (connectionMode) {
  case 'TARS':
    hostName = configuration.tarsReplicaDatabaseHostname;
    databaseName = configuration.tarsReplicaDatabaseName;
    databaseUserName = configuration.tarsReplicaDatabaseUsername;
    databasePassword = configuration.tarsReplicaDatabasePassword;
    break;
  case 'DSP':
    hostName = configuration.desDatabaseHostname;
    databaseName = configuration.desDatabaseName;
    databaseUserName = configuration.desDatabaseUsername;
    databasePassword = configuration.desDatabasePassword;
    break;
  }

  return mysql.createPool({
    host: hostName,
    database: databaseName,
    user: databaseUserName,
    password: databasePassword,
    charset: 'UTF8_GENERAL_CI',
    ssl: process.env.TESTING_MODE ? null : certificate,
    authPlugins: {
      mysql_clear_password: () => () => Buffer.from(`${databasePassword}\0`),
    },
    connectionLimit: 50,
  });
};
