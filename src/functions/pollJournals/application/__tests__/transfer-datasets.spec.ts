import * as examinerRepo from '../../framework/repo/mysql/examiner-repository';
import * as testSlotRepo from '../../framework/repo/mysql/test-slot-repository';
import * as personalCommitmentRepo from '../../framework/repo/mysql/personal-commitment-repository';
import * as nonTestActivityRepo from '../../framework/repo/mysql/non-test-activity-repository';
import * as advanceTestSlotsRepo from '../../framework/repo/mysql/advance-test-slots-repository';
import * as deploymentRepo from '../../framework/repo/mysql/deployment-repository';
import * as journalEndDateRepo from '../../framework/repo/mysql/journal-end-date-repository';
import * as journalRepo from '../../framework/repo/dynamodb/journal-repository';
import * as journalBuilder from '../journal-builder';
import { transferDatasets } from '../transfer-datasets';
import * as config from '../../framework/config/config';
import * as pool from '../../framework/repo/mysql/pool';
import { Mock, Times, It } from 'typemoq';
import * as mysql from 'mysql2';
import { dummyConfig } from '../../framework/config/__mocks__/config';
import * as journalChangeFilter from '../journal-change-filter';

const dummyNonTestActivityDataset = [{ examinerId: 3, nonTestActivity: {} }];
const dummyAdvanceTestSlotDataset = [{ examinerId: 4, advanceTestSlot: {} }];
const dummyDeploymentDataset = [{ examinerId: 5, deployment: {} }];

describe('transferDatasets', () => {
  const moqConfig = Mock.ofInstance(config.config);
  const moqCreateConnectionPool = Mock.ofInstance(pool.createConnectionPool);
  const moqGetExaminers = Mock.ofInstance(examinerRepo.getExaminers);
  const moqGetNextWorkingDay = Mock.ofInstance(journalEndDateRepo.getNextWorkingDay);
  const moqGetJournalEndDate = Mock.ofInstance(journalEndDateRepo.getJournalEndDate);
  const moqGetTestSlots = Mock.ofInstance(testSlotRepo.getTestSlots);
  const moqGetPersonalCommitments = Mock.ofInstance(personalCommitmentRepo.getPersonalCommitments);
  const moqGetNonTestActivities = Mock.ofInstance(nonTestActivityRepo.getNonTestActivities);
  const moqGetAdvanceTestSlots = Mock.ofInstance(advanceTestSlotsRepo.getAdvanceTestSlots);
  const moqGetDeployments = Mock.ofInstance(deploymentRepo.getDeployments);
  const moqBuildJournals = Mock.ofInstance(journalBuilder.buildJournals);
  const moqFilterChangedJournals = Mock.ofInstance(journalChangeFilter.filterChangedJournals);
  const moqSaveJournals = Mock.ofInstance(journalRepo.saveJournals);

  const moqConnectionPool = Mock.ofType<mysql.Pool>();

  const dummyExaminers = [
    { individual_id: 1, staff_number: '99' },
    { individual_id: 2, staff_number: '98' },
    { individual_id: 3, staff_number: '97' },
    { individual_id: 4, staff_number: '96' },
    { individual_id: 5, staff_number: '95' },
  ];
  const dummyNextWorkingDay = new Date();
  const dummyTestSlotDataset = [{ examinerId: 1, testSlot: {} }];
  const dummyPersonalCommitmentDataset = [{ examinerId: 2, personalCommitment: {} }];
  const dummyTransformedJournals = [{ examinerId: 1 }, { examinerId: 2 }];
  const dummyFilteredJournals = [{ examinerId: 1 }];
  const dummyStartTime = new Date();
  const mockJournalEndDate: Date = new Date('2020-01-01');
  const mockNextWorkingDay: Date = new Date('2021-01-01');

  beforeEach(async () => {
    moqConfig.reset();
    moqCreateConnectionPool.reset();
    moqGetExaminers.reset();
    moqGetNextWorkingDay.reset();
    moqGetJournalEndDate.reset();
    moqGetTestSlots.reset();
    moqGetPersonalCommitments.reset();
    moqGetNonTestActivities.reset();
    moqGetAdvanceTestSlots.reset();
    moqGetDeployments.reset();
    moqBuildJournals.reset();
    moqFilterChangedJournals.reset();
    moqSaveJournals.reset();

    spyOn(config, 'config').and.callFake(moqConfig.object);
    spyOn(pool, 'createConnectionPool').and.callFake(moqCreateConnectionPool.object);
    spyOn(examinerRepo, 'getExaminers').and.callFake(moqGetExaminers.object);
    spyOn(testSlotRepo, 'getTestSlots').and.callFake(moqGetTestSlots.object);
    spyOn(personalCommitmentRepo, 'getPersonalCommitments').and.callFake(moqGetPersonalCommitments.object);
    spyOn(nonTestActivityRepo, 'getNonTestActivities').and.callFake(moqGetNonTestActivities.object);
    spyOn(advanceTestSlotsRepo, 'getAdvanceTestSlots').and.callFake(moqGetAdvanceTestSlots.object);
    spyOn(deploymentRepo, 'getDeployments').and.callFake(moqGetDeployments.object);
    spyOn(journalBuilder, 'buildJournals').and.callFake(moqBuildJournals.object);
    spyOn(journalChangeFilter, 'filterChangedJournals').and.callFake(moqFilterChangedJournals.object);
    spyOn(journalRepo, 'saveJournals').and.callFake(moqSaveJournals.object);

    moqCreateConnectionPool.setup(x => x()).returns(() => moqConnectionPool.object);
    moqConfig.setup(x => x()).returns(() => dummyConfig);
    moqGetExaminers.setup(x => x(It.isAny(), It.isAny())).returns(() => Promise.resolve(dummyExaminers));
    moqGetNextWorkingDay.setup(x => x(It.isAny(), It.isAny()))
      .returns(() => Promise.resolve(dummyNextWorkingDay));
    moqGetTestSlots.setup(x => x(It.isAny(), It.isAny(), It.isAny(), It.isAny()))
      .returns(() => Promise.resolve(dummyTestSlotDataset));
    moqGetPersonalCommitments.setup(x => x(It.isAny(), It.isAny(), It.isAny()))
      .returns(() => Promise.resolve(dummyPersonalCommitmentDataset));
    moqGetNonTestActivities.setup(x => x(It.isAny(), It.isAny(), It.isAny()))
      .returns(() => Promise.resolve(dummyNonTestActivityDataset));
    moqGetAdvanceTestSlots.setup(x => x(It.isAny(), It.isAny(), It.isAny(), It.isAny()))
      .returns(() => Promise.resolve(dummyAdvanceTestSlotDataset));
    moqGetDeployments.setup(x => x(It.isAny(), It.isAny(), It.isAny()))
      .returns(() => Promise.resolve(dummyDeploymentDataset));
    moqFilterChangedJournals.setup(x => x(It.isAny(), It.isAny())).returns(() => <any>dummyFilteredJournals);
    moqBuildJournals.setup(x => x(It.isAny(), It.isAny())).returns(() => <any>dummyTransformedJournals);
  });

  it('should retrieve all the datasets and transform into a journal and save', async () => {
    spyOn(journalEndDateRepo, 'getNextWorkingDay').and.callFake(moqGetNextWorkingDay.object);
    spyOn(journalEndDateRepo, 'getJournalEndDate').and.callFake(moqGetJournalEndDate.object);

    await transferDatasets(dummyStartTime);

    moqGetTestSlots.verify(x => x(It.isAny(), It.isAny(), It.isAny(), It.isAny()), Times.once());
    moqGetPersonalCommitments.verify(x => x(It.isAny(), It.isAny(), It.isAny()), Times.once());
    moqGetNonTestActivities.verify(x => x(It.isAny(), It.isAny(), It.isAny()), Times.once());
    moqGetAdvanceTestSlots.verify(x => x(It.isAny(), It.isAny(), It.isAny(), It.isAny()), Times.once());
    moqGetDeployments.verify(x => x(It.isAny(), It.isAny(), It.isAny()), Times.once());

    const expectedDatasets = {
      testSlots: dummyTestSlotDataset,
      personalCommitments: dummyPersonalCommitmentDataset,
      nonTestActivities: dummyNonTestActivityDataset,
      advanceTestSlots: dummyAdvanceTestSlotDataset,
      deployments: dummyDeploymentDataset,
    };
    moqBuildJournals.verify(x => x(It.isValue(dummyExaminers), It.isValue(expectedDatasets)), Times.once());
    moqFilterChangedJournals.verify(
      x => x(It.isValue(<any>dummyTransformedJournals), It.isValue(dummyStartTime)), Times.once());
    moqSaveJournals.verify(x => x(It.isValue(<any>dummyFilteredJournals), It.isValue(dummyStartTime)), Times.once());
  });

  it('should use the journal end date if one is available',  async () => {
    spyOn(journalEndDateRepo, 'getJournalEndDate').and.callFake(() => mockJournalEndDate);
    spyOn(journalEndDateRepo, 'getNextWorkingDay').and.callFake(() => Promise.resolve(mockNextWorkingDay));
    await transferDatasets(dummyStartTime);

    moqGetTestSlots.verify(x => x(It.isAny(), It.isAny(), It.isAny(), mockJournalEndDate), Times.once());
    moqGetNonTestActivities.verify(x => x(It.isAny(), It.isAny(), mockJournalEndDate), Times.once());
    moqGetAdvanceTestSlots.verify(x => x(It.isAny(), It.isAny(), mockJournalEndDate, It.isAny()), Times.once());
    moqGetDeployments.verify(x => x(It.isAny(), It.isAny(), It.isAny()), Times.once());
  });

  it('should use the next working day if journal end date is NOT available', async () => {
    spyOn(journalEndDateRepo, 'getJournalEndDate').and.callFake(() => null);
    spyOn(journalEndDateRepo, 'getNextWorkingDay').and.callFake(() => Promise.resolve(mockNextWorkingDay));
    await transferDatasets(dummyStartTime);

    moqGetTestSlots.verify(x => x(It.isAny(), It.isAny(), It.isAny(), mockNextWorkingDay), Times.once());
    moqGetNonTestActivities.verify(x => x(It.isAny(), It.isAny(), mockNextWorkingDay), Times.once());
    moqGetAdvanceTestSlots.verify(x => x(It.isAny(), It.isAny(), mockNextWorkingDay, It.isAny()), Times.once());
    moqGetDeployments.verify(x => x(It.isAny(), It.isAny(), It.isAny()), Times.once());
  });
});
