import {
  throwIfNotPresent,
  tryFetchRdsAccessToken,
} from './config-helpers';
import { ddbTable, DdbTableTypes } from "../../application/utils/ddbTable";

let configuration: Config;

export const bootstrapConfig = async (type: DdbTableTypes) => {
  configuration = {
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
    ),
    timeTravelDate: process.env.TIME_TRAVEL_DATE,
  };
};

export type Config = {
  isOffline: boolean;
  dynamodbTableName: string;
  tarsReplicaDatabaseHostname: string;
  tarsReplicaDatabaseName: string;
  tarsReplicaDatabaseUsername: string;
  tarsReplicaDatabasePassword: string;
  timeTravelDate?: string;
};

export const config = (): Config => configuration;