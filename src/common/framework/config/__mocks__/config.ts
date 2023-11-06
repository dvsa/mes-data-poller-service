import { Config } from '../config';

export const dummyConfig: Config = {
  isOffline: true,
  dynamodbTableName: 'journals',
  tarsReplicaDatabaseHostname: 'localhost',
  tarsReplicaDatabaseName: 'dummydbname',
  tarsReplicaDatabasePassword: 'dummypassword',
  tarsReplicaDatabaseUsername: 'dummyusername',
  timeTravelDate: '2019-03-13',
};
