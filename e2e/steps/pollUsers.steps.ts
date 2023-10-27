/* tslint:disable:max-line-length */
import { Given, BeforeAll, setDefaultTimeout, When, Then, After, AfterAll } from '@cucumber/cucumber';
import * as mysql from 'mysql2';
import { DynamoDB } from 'aws-sdk';
import nodeFetch from 'node-fetch';
import { query } from '../../src/common/framework/mysql/database';
import { expect } from 'chai';

setDefaultTimeout(3 * 60 * 1000);

let mysqlConn: mysql.Connection;
let ddb: DynamoDB.DocumentClient;

BeforeAll(() => {
  ddb = new DynamoDB.DocumentClient({ endpoint: 'localhost:8000', region: 'localhost', sslEnabled: false });
  mysqlConn = mysql.createConnection({
    host: 'localhost',
    database: 'tarsreplica',
    user: 'root',
    password: 'Pa55word1',
  });
});

AfterAll(() => {
  mysqlConn.end();
});

After(() => {
  return Promise.all([
    query(mysqlConn, 'TRUNCATE TABLE EXAMINER'),
    query(mysqlConn, 'TRUNCATE TABLE EXAMINER_STATUS'),
  ]);
});

Given('there is no examiner in the TARS replica with staffNumber {string}', (staffNumber: string) => {
});

Given('there is no examiner in the cache with staffNumber {string}', (staffNumber: string) => {
});

Given('there is an active examiner in the TARS replica with staffNumber {string}', async (staffNumber: string) => {
  const individualId = 1;
  await query(mysqlConn, `INSERT INTO EXAMINER (STAFF_NUMBER, GRADE_CODE, INDIVIDUAL_ID) VALUES (${staffNumber}, 'DE', ${individualId})`);
  await query(mysqlConn, `INSERT INTO EXAMINER_STATUS (INDIVIDUAL_ID, START_DATE, END_DATE) VALUES (${individualId}, '1970-01-01', '4000-01-01')`);
});

Given('there is an inactive examiner in the TARS replica with staffNumber {string}', async (staffNumber: string) => {
  const individualId = 1;
  await query(mysqlConn, `INSERT INTO EXAMINER (STAFF_NUMBER, GRADE_CODE, INDIVIDUAL_ID) VALUES (${staffNumber}, 'DE', ${individualId})`);
  await query(mysqlConn, `INSERT INTO EXAMINER_STATUS (INDIVIDUAL_ID, START_DATE, END_DATE) VALUES (${individualId}, '1970-01-01', '2005-01-01')`);
});

Given('there is an examiner in the cache with staffNumber {string}', (staffNumber: string) => {
  return ddb.put({
    TableName: 'users',
    Item: {
      Key: {
        staffNumber,
      },
    },
  });
});

When('I invoke the user poller', async () => {
  const fetchRes = await nodeFetch('http://localhost:3000/pollUsers');
  await fetchRes.json();
});

Then('there should be an examiner in the cache with staffNumber {string}', async (staffNumber: string) => {
  const result = await ddb.get({
    TableName: 'users',
    Key: {
      staffNumber,
    },
  }).promise();

  // @ts-ignore
  expect(result.Item.staffNumber).to.equal(staffNumber);
});

Then('there should not be an examiner in the cache with staffNumber {string}', async (staffNumber: string) => {
  const result = await ddb.get({
    TableName: 'users',
    Key: {
      staffNumber,
    },
  }).promise();

  expect(result.Item).to.be.undefined;
});
