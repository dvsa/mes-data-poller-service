import { customDurationMetric, customMetric, info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { chunk } from 'lodash';
import { ExaminerTestSlot } from '../../domain/examiner-test-slot';
import { AllDatasets } from '../../domain/all-datasets';
import { JournalRecord } from '../../domain/journal-record';
import { buildJournals } from '../../application/journal-builder';
import { filterChangedJournals } from '../../application/journal-change-filter';
import { saveJournals } from '../databases/dynamodb/journal-repository';
import {getDESConnectionPool, getTARSConnectionPool} from '../../../../common/framework/mysql/database';
import { getExaminers } from '../databases/mysql/examiner-repository';
import { getJournalEndDate, getNextWorkingDay } from '../databases/mysql/journal-end-date-repository';
import { getPersonalCommitments } from '../databases/mysql/personal-commitment-repository';
import { getNonTestActivities } from '../databases/mysql/non-test-activity-repository';
import { getAdvanceTestSlots } from '../databases/mysql/advance-test-slots-repository';
import { getDeployments } from '../databases/mysql/deployment-repository';
import {getDESTestSlots, getTestSlots} from '../databases/mysql/test-slot-repository';
import * as moment from 'moment';

export const getJournalDetails = async (startTime: Date, startDate: Date, journalStartDate: Date) => {
  const connectionPool = getTARSConnectionPool();
  const journalQueryPhaseStart = new Date();
  console.log('----------------- JOURNAL POLL START -----------------');
  info('STARTING QUERY PHASE:', journalQueryPhaseStart);

  const [
    examiners,
    nextWorkingDay,
  ] = await Promise.all([
    getExaminers(connectionPool, startDate),
    getNextWorkingDay(connectionPool, startDate),
  ]);

  const examinerIds = examiners.map(examiner => examiner.individual_id);
  const journalEndDate: Date = getJournalEndDate() || nextWorkingDay;

  info(`Loading journals for ${examiners.length} examiners from ${moment(journalStartDate).format('DD-MM-YYYY')}` +
    ` to ${moment(journalEndDate).format('DD-MM-YYYY')}...`);

  const [
    personalCommitments,
    nonTestActivities,
    advanceTestSlots,
    deployments,
    testSlotsDES,
  ] = await Promise.all([
    getPersonalCommitments(connectionPool, journalStartDate, 20), // 20 days range
    getNonTestActivities(connectionPool, journalStartDate, journalEndDate),
    getAdvanceTestSlots(connectionPool, startDate, journalEndDate, 14), // 14 days range
    getDeployments(connectionPool, startDate, 6), // 6 months range
    getDESTestSlots(getDESConnectionPool(), examiners, journalStartDate, journalEndDate),
  ]);

  const examinerIdGroupCount = Math.ceil(examiners.length / 5);
  info(`Examiners will be separated into chunks of ${examinerIdGroupCount}`);

  const examinerChunks = chunk(examinerIds, examinerIdGroupCount);

  const testSlotsTARS = (
    await Promise.all(
      examinerChunks.map(
        (examinerChunk, index) =>
          getTestSlots(connectionPool, examinerChunk, journalStartDate, journalEndDate, index),
      ),
    )
  ).reduce((acc: ExaminerTestSlot[], curr: ExaminerTestSlot[]) => acc?.concat(curr));

  const journalQueryPhaseEnd = new Date();
  customDurationMetric(
    'JournalQueryPhase',
    'Time taken running all TARSREPL queries, in seconds',
    journalQueryPhaseStart,
    journalQueryPhaseEnd,
  );

  const datasets: AllDatasets = {
    testSlots: [...testSlotsTARS, ...testSlotsDES],
    personalCommitments,
    nonTestActivities,
    advanceTestSlots,
    deployments,
  };
  connectionPool.end();

  info(`FINISHED QUERY PHASE, STARTING TRANSFORM PHASE: ${new Date()}`);
  const journals: JournalRecord[] = buildJournals(examiners, datasets);

  const changedJournals = await filterChangedJournals(journals, startTime);
  customMetric('JournalsChanged', 'Number of Journals found to have changed', changedJournals.length);

  const journalWritePhaseStart = new Date();
  await saveJournals(changedJournals, startTime);
  const journalWritePhaseEnd = new Date();
  customDurationMetric('JournalWritePhase', 'Time taken running all Dynamo writes, in seconds',
                       journalWritePhaseStart, journalWritePhaseEnd);
  info(`FINISHED SAVE PHASE: ${new Date()}`);
};
