import {
  throwIfNotPresent,
  tryFetchRdsAccessToken,
} from './config-helpers';
import { ddbTable, DdbTableTypes } from '../../application/utils/ddbTable';

let configuration: Config;

export const bootstrapConfig = async (type: DdbTableTypes) => {
  configuration = {
    s3BucketName: process.env.S3_BUCKET_NAME,
    isOffline: !!process.env.IS_OFFLINE,
    dynamodbTableName: ddbTable(type),
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
      'tarsReplicateDatabaseHostname',
      'tarsReplicaDatabaseUsername'
    ),
    timeTravelDate: process.env.TIME_TRAVEL_DATE,
    desDatabaseHostname: throwIfNotPresent(
      process.env.DES_DATABASE_HOSTNAME,
      'desDatabaseHostname',
    ),
    desDatabaseName: throwIfNotPresent(
      process.env.DES_DATABASE_NAME,
      'desDatabaseName',
    ),
    desDatabaseUsername: throwIfNotPresent(
      process.env.DES_DATABASE_USERNAME,
      'desDatabaseUsername',
    ),
    desDatabasePassword: (process.env.IS_OFFLINE === 'true')
      ? process.env.DES_DATABASE_PASSWORD
      : await tryFetchRdsAccessToken(
        process.env.DES_DATABASE_ENDPOINT || '',
        process.env.DES_DATABASE_USERNAME || '',
        'SECRET_DB_PASSWORD_KEY',
        'mesDatabaseHostname',
        'mesDatabaseUsername'
      ),
  };
};

export const bootstrapReapJournalsConfig = async (type: DdbTableTypes) => {
  configuration = {
    isOffline: !!process.env.IS_OFFLINE,
    dynamodbTableName: ddbTable(DdbTableTypes.JOURNALS),
    tarsReplicaDatabaseHostname: undefined, // Not required for reapJournals
    tarsReplicaDatabaseName: undefined, // Not required for reapJournals
    tarsReplicaDatabaseUsername: undefined, // Not required for reapJournals
    tarsReplicaDatabasePassword: undefined, // Not required for reapJournals
    timeTravelDate: undefined, // Not required for reapJournals
    desDatabaseHostname: undefined, // Not required for reapJournals
    desDatabaseName: undefined, // Not required for reapJournals
    desDatabaseUsername: undefined, // Not required for reapJournals
    desDatabasePassword: undefined, // Not required for reapJournals
    s3BucketName: undefined, // Not required for reapJournals
  };
};

export type Config = {
  isOffline: boolean;
  dynamodbTableName: string;
  s3BucketName: string;
  tarsReplicaDatabaseHostname: string;
  tarsReplicaDatabaseName: string;
  tarsReplicaDatabaseUsername: string;
  tarsReplicaDatabasePassword: string;
  timeTravelDate: string;
  desDatabaseHostname: string;
  desDatabaseName: string;
  desDatabaseUsername: string;
  desDatabasePassword: string;
};

export const config = (): Config => configuration;
