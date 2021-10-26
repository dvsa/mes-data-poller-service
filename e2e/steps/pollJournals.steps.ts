/* tslint:disable:max-line-length */
import { When, Then, setDefaultTimeout, BeforeAll } from '@cucumber/cucumber';
import { DynamoDB } from 'aws-sdk';
import nodeFetch from 'node-fetch';
import { expect } from 'chai';

setDefaultTimeout(3 * 60 * 1000);

let ddb: DynamoDB.DocumentClient;

BeforeAll(() => {
  ddb = new DynamoDB.DocumentClient({ endpoint: 'localhost:8000', region: 'localhost', sslEnabled: false });
});

When('I invoke the journal poller', async () => {
  const fetchRes = await nodeFetch('http://localhost:3000/pollJournals');
  await fetchRes.json();
});

Then('there should be a journal in the cache for staffNumber {string}', async (staffNumber: string) => {
  const result = await ddb.get({
    TableName: 'journals',
    Key: {
      staffNumber,
    },
  }).promise();
  expect(result.Item).not.to.be.undefined;
});
