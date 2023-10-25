import {
  defaultIfNotPresent,
  throwIfNotPresent,
  tryFetchRdsAccessToken,
} from '../../../common/framework/config/config-helpers';

export type Config = {
  isOffline: boolean;
  dynamodbTableName: string;
  tarsReplicaDatabaseHostname: string;
  tarsReplicaDatabaseName: string;
  tarsReplicaDatabaseUsername: string;
  tarsReplicaDatabasePassword: string;
};

let configuration: Config;

export const bootstrapDelegatedExaminerConfig = async () => {
  configuration = {
    isOffline: !!process.env.IS_OFFLINE,
    dynamodbTableName:
      defaultIfNotPresent(process.env.DELEGATED_BOOKINGS_DDB_TABLE_NAME, 'delegated-bookings'),
    tarsReplicaDatabaseHostname: throwIfNotPresent(
      process.env.TARS_REPLICA_HOST_NAME,
      'tarsReplicaDatabaseHostname',
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

export const config = () => configuration;
