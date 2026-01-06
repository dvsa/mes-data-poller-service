import { ExaminerTestSlot } from '../pollJournals/domain/examiner-test-slot';
import * as fs from 'fs';
import * as path from 'path';
import { AdvanceTestSlot, Deployment, NonTestActivity, PersonalCommitment, TestSlot } from '@dvsa/mes-journal-schema';
import {ExaminerRecord} from '../pollJournals/domain/examiner-record';
import {ExaminerPersonalCommitment} from '../pollJournals/domain/examiner-personal-commitment';
import {ExaminerNonTestActivity} from '../pollJournals/domain/examiner-non-test-activity';
import {ExaminerDeployment} from '../pollJournals/domain/examiner-deployment';
import { ExaminerAdvanceTestSlot } from '../pollJournals/domain/examiner-advance-test-slot';

const journalsDir = './test-data/journals';
const files = fs.readdirSync(journalsDir);

export async function getExaminersMock():Promise<ExaminerRecord[]> {
  const examinerRecords: ExaminerRecord[] = [];
  files.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(journalsDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const examinerRecord: ExaminerRecord ={
        staff_number: data.journal.examiner.staffNumber,
        individual_id: data.journal.examiner.individualId,
      };
      examinerRecords.push(examinerRecord);
    }
  });
  return examinerRecords;
}

export async function getTestSlotsMock(): Promise<ExaminerTestSlot[]> {
  const examinerTestSlots: ExaminerTestSlot[] = [];
  files.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(journalsDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const examinerId = data?.journal?.examiner?.individualId;
      const testSlots: TestSlot[] | undefined = data?.journal?.testSlots;
      if (Array.isArray(testSlots)) {
        testSlots.forEach(testSlot => {
          examinerTestSlots.push({ examinerId, testSlot });
        });
      }
    }
  });
  return examinerTestSlots;
}

export async function getPersonalCommitmentsMock():Promise<ExaminerPersonalCommitment[]>{
  const examinerPersonalCommitments: ExaminerPersonalCommitment[] = [];
  files.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(journalsDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const examinerId = data?.journal?.examiner?.individualId;
      const personalCommitments: PersonalCommitment[] | undefined = data?.journal?.personalCommitment;
      if (Array.isArray(personalCommitments)) {
        personalCommitments.forEach(personalCommitment => {
          examinerPersonalCommitments.push({ examinerId, personalCommitment });
        });
      }
    }
  });
  return examinerPersonalCommitments;
}

export async function getNonTestActivitiesMock(): Promise<ExaminerNonTestActivity[]> {
  const examinerNonTestActivities: ExaminerNonTestActivity[] = [];

  files.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(journalsDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const examinerId = data?.journal?.examiner?.individualId;
      const nonTestActivities: NonTestActivity[] | undefined = data?.journal?.nonTestActivities;
      if (Array.isArray(nonTestActivities)) {
        nonTestActivities.forEach(nonTestActivity => {
          examinerNonTestActivities.push({ examinerId, nonTestActivity });
        });
      }
    }
  });
  return examinerNonTestActivities;
}

export async function getDeploymentsMock(): Promise<ExaminerDeployment[]>  {
  const examinerDeployments: ExaminerDeployment[] = [];

  files.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(journalsDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const examinerId = data?.journal?.examiner?.individualId;
      const deployments: Deployment[] | undefined = data?.journal?.deployments;
      if (Array.isArray(deployments)) {
        deployments.forEach(deployment => {
          examinerDeployments.push({ examinerId, deployment });
        });
      }
    }
  });
  return examinerDeployments;

}

export async function getAdvanceTestSlotsMock(): Promise<ExaminerAdvanceTestSlot[]>  {
  const examinerAdvanceTestSlots: ExaminerAdvanceTestSlot[] = [];

  files.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(journalsDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const examinerId = data?.journal?.examiner?.individualId;
      const advanceTestSlots: AdvanceTestSlot[] | undefined = data?.journal?.advanceTestSlots;
      if (Array.isArray(advanceTestSlots)) {
        advanceTestSlots.forEach(advanceTestSlot => {
          examinerAdvanceTestSlots.push({ examinerId, advanceTestSlot });
        });
      }
    }
  });
  return examinerAdvanceTestSlots;

}

export async function getNextWorkingDayMock() {
  // For mock purposes, return today's date
  return new Date();
}
