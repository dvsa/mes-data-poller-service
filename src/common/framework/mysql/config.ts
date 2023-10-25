import {
    defaultIfNotPresent,
    throwIfNotPresent,
    tryFetchRdsAccessToken,
} from '../config/config-helpers';

let configuration: Config;

export type Config = {
    isOffline: boolean;
    usersDynamodbTableName: string;
    testCentreDynamodbTableName: string;
    delegatedBookingsDynamodbTableName: string;
    journalDynamodbTableName: string;
    tarsReplicaDatabaseHostname: string;
    tarsReplicaDatabaseName: string;
    tarsReplicaDatabaseUsername: string;
    tarsReplicaDatabasePassword: string;
    timeTravelDate: string;
};

export const bootstrapConfig = async () => {
    configuration = {
        isOffline: !!process.env.IS_OFFLINE,
        usersDynamodbTableName: defaultIfNotPresent(process.env.USERS_DDB_TABLE_NAME, 'users'),
        journalDynamodbTableName: defaultIfNotPresent(process.env.USERS_DDB_TABLE_NAME, 'journal'),
        delegatedBookingsDynamodbTableName:
            defaultIfNotPresent(process.env.DELEGATED_BOOKINGS_DDB_TABLE_NAME, 'delegated-bookings'),
        testCentreDynamodbTableName:
            defaultIfNotPresent(process.env.TEST_CENTRE_DDB_TABLE_NAME, 'test-centre'),
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

export const config = (): Config => configuration;
