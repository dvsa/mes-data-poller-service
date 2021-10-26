import * as JournalRepository from '../journal-repository';
import * as config from '../../../config/config';
import * as AWSMock from 'aws-sdk-mock';
import { dummyConfig } from '../../../config/__mocks__/config';
import { JournalRecord } from '../../../../domain/journal-record';
import moment = require('moment');
import { DynamoDB } from 'aws-sdk';

describe('JournalRepository', () => {
  const startTime = moment('2019-01-01 10:30:00.000');
  const sufficientTime = startTime.clone().add({ seconds: 2 });
  const outOfTime = startTime.clone().add({ seconds: JournalRepository.pollerFrequency - 2 });

  beforeEach(() => {
    spyOn(config, 'config').and.returnValue(dummyConfig);
  });

  describe('getStaffNumbersWithHashes', () => {

    const hash1 = { staffNumber: '1', hash: 'a' };
    const hash2 = { staffNumber: '2', hash: 'b' };
    const hash3 = { staffNumber: '3', hash: 'c' };
    const hash4 = { staffNumber: '4', hash: 'd' };

    it('should call dynamo then populate cache if cache invalid', async () => {
      spyOn(JournalRepository.journalHashesCache, 'isValid').and.returnValue(false);
      spyOn(JournalRepository.journalHashesCache, 'clearAndPopulate');

      AWSMock.mock('DynamoDB.DocumentClient', 'scan', (params, cb) => {
        let ddbResp;
        if (!params.ExclusiveStartKey) {
          ddbResp = {
            Items: [hash1, hash2],
            LastEvaluatedKey: hash2.staffNumber,
          };
        } else {
          ddbResp = {
            Items: [hash3, hash4],
          };
        }
        cb(null, ddbResp);
      });

      const expected = [hash1, hash2, hash3, hash4];

      const result = await JournalRepository.getStaffNumbersWithHashes(startTime.toDate());

      expect(result).toEqual(expected);
      expect(JournalRepository.journalHashesCache.isValid).toHaveBeenCalledWith(startTime.toDate());
      expect(JournalRepository.journalHashesCache.clearAndPopulate).toHaveBeenCalledWith(expected, startTime.toDate());
    });

    it('should use cache if valid', async () => {
      const expected = [hash1, hash2, hash3];
      spyOn(JournalRepository.journalHashesCache, 'isValid').and.returnValue(true);
      spyOn(JournalRepository.journalHashesCache, 'get').and.returnValue(expected);

      const ddbSpy = jasmine.createSpy();
      spyOn(JournalRepository, 'getDynamoClient').and.returnValue(ddbSpy as unknown as DynamoDB.DocumentClient);

      const result = await JournalRepository.getStaffNumbersWithHashes(startTime.toDate());

      expect(result).toEqual(expected);
      expect(JournalRepository.journalHashesCache.isValid).toHaveBeenCalledWith(startTime.toDate());
      expect(JournalRepository.journalHashesCache.get).toHaveBeenCalledTimes(1);
      expect(ddbSpy).not.toHaveBeenCalled();
    });
  });

  describe('saveJournals', () => {
    beforeEach(() => {
      spyOn(JournalRepository, 'sleep').and.callFake(() => { return Promise.resolve(); });
      spyOn(JournalRepository.journalHashesCache, 'update');
    });

    it('not save if no journals', async () => {
      const ddbSpy = jasmine.createSpy();
      spyOn(JournalRepository, 'getDynamoClient').and.returnValue(ddbSpy as unknown as DynamoDB.DocumentClient);

      await JournalRepository.saveJournals([], startTime.toDate());

      expect(ddbSpy).not.toHaveBeenCalled(); // no dynamo save
      expect(JournalRepository.journalHashesCache.update).toHaveBeenCalledWith(startTime.toDate(), []);
    });

    it('should write a single batch and update the cache', async () => {
      const { journals, hashes } = generateDummyJournals(10); // less than batch size
      spyOn(JournalRepository, 'now').and.callFake(() => { return sufficientTime; });

      AWSMock.mock('DynamoDB.DocumentClient', 'batchWrite', (params, cb) => {
        const ddbResp = {
          UnprocessedItems: {},
          ConsumedCapacity: [
            {
              TableName: dummyConfig.journalDynamodbTableName,
              CapacityUnits: 49,
            },
          ],
        };
        cb(null, ddbResp);
      });

      await JournalRepository.saveJournals(journals, startTime.toDate());

      expect(JournalRepository.journalHashesCache.update).toHaveBeenCalledTimes(2);
    });

    it('should write multiple batches and update the cache', async () => {
      const { journals, hashes } = generateDummyJournals(60); // should batch as 25, 25, 10 items
      spyOn(JournalRepository, 'now').and.callFake(() => { return sufficientTime; });

      AWSMock.mock('DynamoDB.DocumentClient', 'batchWrite', (params, cb) => {
        const ddbResp = {
          UnprocessedItems: {},
          ConsumedCapacity: [
            {
              TableName: dummyConfig.journalDynamodbTableName,
              CapacityUnits: 49,
            },
          ],
        };
        cb(null, ddbResp);
      });

      await JournalRepository.saveJournals(journals, startTime.toDate());

      expect(JournalRepository.journalHashesCache.update).toHaveBeenCalledTimes(4); // 1 timestamp, 3 batches
    });

    it('should exclude any failed writes from the cache', async () => {
      const { journals, hashes } = generateDummyJournals(10); // less than batch size
      const expectedHashes = hashes.filter((hash) => { hash.staffNumber === '2000'; }); // examiner 2000 failed
      spyOn(JournalRepository, 'now').and.callFake(() => { return sufficientTime; });

      AWSMock.mock('DynamoDB.DocumentClient', 'batchWrite', (params, cb) => {
        const ddbResp = {
          UnprocessedItems: { // examiner 2000 failed...
            journals: [
              {
                PutRequest: {
                  Item: {
                    staffNumber: '2000',
                    journal: {
                      type: 'Buffer',
                      data: [31, 139, 0, 0, 237, 182],
                    },
                    lastUpdatedAt: 200000,
                    hash: '20000',
                  },
                },
              },
            ],
          },
          ConsumedCapacity: [
            {
              TableName: dummyConfig.journalDynamodbTableName,
              CapacityUnits: 49,
            },
          ],
        };
        cb(null, ddbResp);
      });

      await JournalRepository.saveJournals(journals, startTime.toDate());

      expect(JournalRepository.journalHashesCache.update).toHaveBeenCalledWith(startTime.toDate(), expectedHashes);
    });

    it('abort if run out of time', async () => {
      const { journals } = generateDummyJournals(10); // less than batch size
      const ddbSpy = jasmine.createSpy();
      spyOn(JournalRepository, 'getDynamoClient').and.returnValue(ddbSpy as unknown as DynamoDB.DocumentClient);
      spyOn(JournalRepository, 'now').and.returnValue(outOfTime);

      await JournalRepository.saveJournals(journals, startTime.toDate());

      expect(ddbSpy).not.toHaveBeenCalled(); // no dynamo save
      expect(JournalRepository.journalHashesCache.update).toHaveBeenCalledTimes(1); // only updates timestamp
    });
  });
});

const generateDummyJournals = (count: number): { journals: JournalRecord[]; hashes: Partial<JournalRecord>[] } => {
  const journals = [] as JournalRecord[];
  const hashes = [] as Partial<JournalRecord>[];

  for (let index = 0; index < count; index += 1) {
    journals[index] = {
      staffNumber: (index * 1000).toString(),
      hash: (index * 10000).toString(),
      lastUpdatedAt: index * 100000,
      journal: Buffer.from('aabbcc'),
    };

    hashes[index] = {
      staffNumber: (index * 1000).toString(),
      hash: (index * 10000).toString(),
    };
  }
  return { journals, hashes };
};
