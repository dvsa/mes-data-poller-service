import * as mysql from 'mysql2';
import { config } from '../../config/config';
import { certificate } from '../../../../../common/certs/ssl_profiles';

export const createConnectionPool = (): mysql.Pool => {
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
