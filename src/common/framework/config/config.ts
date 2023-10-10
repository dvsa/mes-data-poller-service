import {
  defaultIfNotPresent,
  throwIfNotPresent,
  tryFetchRdsAccessToken,
} from './config-helpers';

let configuration: Config;

export const bootstrapConfig = async () => {
  configuration = {
    isOffline: !!process.env.IS_OFFLINE,
    usersDynamodbTableName: defaultIfNotPresent(process.env.USERS_DDB_TABLE_NAME, 'users'),
    tarsReplicaDatabaseHostname: throwIfNotPresent(
      process.env.TARS_REPLICA_HOST_NAME,
      'tarsReplicateDatabaseHostname',
    ),
    tarsReplicaDatabaseName: throwIfNotPresent(
      process.env.TARS_REPLICA_DB_NAME,
      'tarsReplicaDatabaseName',
    ),
    tarsReplicaDatabaseUsername: throwIfNotPresent(
      process.env.TARS_REPLICA_DB_USERNAME,
      'tarsReplicaDatabaseUsername',
    ),
    tarsReplicaDatabasePassword: await tryFetchRdsAccessToken(
      process.env.TARS_REPLICA_ENDPOINT,
      process.env.TARS_REPLICA_DB_USERNAME,
      'SECRET_DB_PASSWORD_KEY',
    ),
  };
};

export type Config = {
  isOffline: boolean;
  usersDynamodbTableName: string;
  tarsReplicaDatabaseHostname: string;
  tarsReplicaDatabaseName: string;
  tarsReplicaDatabaseUsername: string;
  tarsReplicaDatabasePassword: string;
};

export const config = (): Config => configuration;
