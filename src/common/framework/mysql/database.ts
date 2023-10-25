import * as mysql from 'mysql2';
import {certificate} from "../../certs/ssl_profiles";
import {config} from "./config";

export const query = async (
    connection: mysql.Connection | mysql.Pool,
    sql: string, args?: any,
) => connection.promise().query(sql, args) as Promise<any[]>;

export const getConnectionPool = (): mysql.Pool => {
    const configuration = config();

    return mysql.createPool({
        host: configuration.tarsReplicaDatabaseHostname,
        database: configuration.tarsReplicaDatabaseName,
        user: configuration.tarsReplicaDatabaseUsername,
        password: configuration.tarsReplicaDatabasePassword,
        charset: 'UTF8_GENERAL_CI',
        ssl: process.env.TESTING_MODE ? null : certificate,
        connectionLimit: 50,
        authPlugins: {
            mysql_clear_password: () => () => Buffer.from(`${configuration.tarsReplicaDatabasePassword}\0`),
        },
    });
};

export const getConnection = (): mysql.Connection => {
    const configuration = config();

    return mysql.createConnection({
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
};
