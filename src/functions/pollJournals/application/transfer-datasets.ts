import * as moment from 'moment';
import { chunk } from 'lodash';
import { ExaminerTestSlot } from '../domain/examiner-test-slot';
import { getTestSlots } from '../framework/repo/mysql/test-slot-repository';
import { getPersonalCommitments } from '../framework/repo/mysql/personal-commitment-repository';
import { getNonTestActivities } from '../framework/repo/mysql/non-test-activity-repository';
import { getAdvanceTestSlots } from '../framework/repo/mysql/advance-test-slots-repository';
import { getDeployments } from '../framework/repo/mysql/deployment-repository';
import { createConnectionPool } from '../framework/repo/mysql/pool';
import { getExaminers } from '../framework/repo/mysql/examiner-repository';
import { AllDatasets } from '../domain/all-datasets';
import { JournalRecord } from '../domain/journal-record';
import { buildJournals } from './journal-builder';
import { saveJournals } from '../framework/repo/dynamodb/journal-repository';
import { filterChangedJournals } from './journal-change-filter';
import { getJournalEndDate, getNextWorkingDay } from '../framework/repo/mysql/journal-end-date-repository';
import { config } from '../framework/config/config';
import { info, customMetric, customDurationMetric } from '@dvsa/mes-microservice-common/application/utils/logger';

export const transferDatasets = async (startTime: Date): Promise<void> => {
  const connectionPool = createConnectionPool();

  info(`STARTING QUERY PHASE: ${new Date()}`);

  let startDate: Date;

  if (config().timeTravelDate != null) {
    // Assumes fixed format for TIME_TRAVEL_DATE, e.g. 2019-03-13
    startDate = moment(config().timeTravelDate).toDate();
  } else {
    // time window starts at the beginning of the initial day
    startDate = moment(startDate).startOf('day').toDate();
  }

  const journalDaysPast: number = 14;
  let journalStartDate: Date;

  if (config().timeTravelDate != null) {
    // Assumes fixed format for TIME_TRAVEL_DATE, e.g. 2019-03-13
    journalStartDate = moment(config().timeTravelDate).subtract(journalDaysPast, 'days').toDate();
  } else {
    // time window starts at the beginning of the initial day
    journalStartDate = moment(startDate).subtract(journalDaysPast, 'days').startOf('day').toDate();
  }

  const journalQueryPhaseStart = new Date();

  const [
    examiners,
    nextWorkingDay,
  ] = await Promise.all([
    getExaminers(connectionPool, startDate),
    getNextWorkingDay(connectionPool, startDate),
  ]);
  const examinerIds = examiners.map(examiner => examiner.individual_id);
  const journalEndDate: Date = getJournalEndDate() || nextWorkingDay;

  info(`Loading journals for ${examiners.length} examiners from ${formatDate(journalStartDate)}` +
    ` to ${formatDate(journalEndDate)}...`);

  const [
    personalCommitments,
    nonTestActivities,
    advanceTestSlots,
    deployments,
  ] = await Promise.all([
    getPersonalCommitments(connectionPool, journalStartDate, 20), // 20 days range
    getNonTestActivities(connectionPool, journalStartDate, journalEndDate),
    getAdvanceTestSlots(connectionPool, startDate, journalEndDate, 14), // 14 days range
    getDeployments(connectionPool, startDate, 6), // 6 months range
  ]);

  const examinerIdGroupCount = Math.floor(examiners.length / 5);
  info(`Examiners will be separated into chunks of ${examinerIdGroupCount}`);

  const examinerChunks = chunk(examinerIds, examinerIdGroupCount);

  const testSlots = (
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
    testSlots,
    personalCommitments,
    nonTestActivities,
    advanceTestSlots,
    deployments,
  };
  connectionPool.end();

  info(`FINISHED QUERY PHASE, STARTING TRANSFORM PHASE: ${new Date()}`);
  console.log(datasets);
  const journals: JournalRecord[] = buildJournals(examiners, datasets);
  info(`FINISHED TRANFORM PHASE, STARTING FILTER PHASE: ${new Date()}`);

  const changedJournals = await filterChangedJournals(journals, startTime);
  info(`FINISHED FILTER PHASE, STARTING SAVE PHASE FOR ${changedJournals.length} JOURNALS: ${new Date()}`);
  customMetric('JournalsChanged', 'Number of Journals found to have changed', changedJournals.length);

  const journalWritePhaseStart = new Date();
  await saveJournals(changedJournals, startTime);
  const journalWritePhaseEnd = new Date();
  customDurationMetric('JournalWritePhase', 'Time taken running all Dynamo writes, in seconds',
                       journalWritePhaseStart, journalWritePhaseEnd);
  info(`FINISHED SAVE PHASE: ${new Date()}`);
};

const formatDate = (date: Date): string => {
  return moment(date).format('DD-MM-YYYY');
};
