import * as mysql from 'mysql2';
import { loadTestFile } from './test-data-utils';
import * as moment from 'moment';
import { query } from '../../../../../../common/framework/mysql/database';
import { getPersonalCommitments } from '../personal-commitment-repository';

export const personalCommitmentIntegrationTests = () => {
  describe('PersonalCommitmentRepository', () => {
    let connectionPool: mysql.Pool;

    beforeAll(() => {
      connectionPool = mysql.createPool({
        host: 'localhost',
        database: 'tarsreplica',
        user: 'root',
        password: 'Pa55word1',
      });
    });

    afterEach(async () => {
      await truncateTables();
    });

    afterAll(() => {
      connectionPool.end();
    });

    it('should retrieve a personal commitment that is today', async () => {
      await loadTestFile('personal-commitment/000-support-data.sql');
      await loadTestFile('personal-commitment/001-today.sql');

      const commitments = await getPersonalCommitments(connectionPool, moment().startOf('day').toDate(), 14);

      expect(commitments).toEqual([
        {
          examinerId: 1,
          personalCommitment: {
            activityCode: '081',
            activityDescription: 'Annual Leave',
            commitmentId: 9,
            slotId: 6,
          },
        },
      ]);
    });

    it('should retrieve a personal commitment ending at the last moment of the time window', async () => {
      await loadTestFile('personal-commitment/000-support-data.sql');
      await loadTestFile('personal-commitment/002-last-moment-of-window.sql');

      const commitments = await getPersonalCommitments(connectionPool, moment().startOf('day').toDate(), 14);

      expect(commitments).toEqual([
        {
          examinerId: 1,
          personalCommitment: {
            activityCode: '081',
            activityDescription: 'Annual Leave',
            commitmentId: 9,
            slotId: 6,
          },
        },
      ]);
    });

    it('should not retrieve personal commitments that are outside the time window', async () => {
      await loadTestFile('personal-commitment/000-support-data.sql');
      await loadTestFile('personal-commitment/003-first-moment-outside-window.sql');

      const commitments = await getPersonalCommitments(connectionPool, moment().startOf('day').toDate(), 14);

      expect(commitments.length).toBe(0);
    });
  });
};

const truncateTables = async () => {
  const truncConn = mysql.createConnection({
    host: 'localhost',
    database: 'tarsreplica',
    user: 'root',
    password: 'Pa55word1',
  });
  await query(truncConn, 'TRUNCATE TABLE INDIVIDUAL');
  await query(truncConn, 'TRUNCATE TABLE EXAMINER');
  await query(truncConn, 'TRUNCATE TABLE EXAMINER_STATUS');
  await query(truncConn, 'TRUNCATE TABLE PROGRAMME');
  await query(truncConn, 'TRUNCATE TABLE PROGRAMME_SLOT');
  await query(truncConn, 'TRUNCATE TABLE PERSONAL_COMMITMENT');
  await query(truncConn, 'TRUNCATE TABLE COMMITMENT_AFFECTED_SLOT');
  truncConn.end();
};
