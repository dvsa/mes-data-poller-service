import { ExaminerTestSlot } from '../../domain/examiner-test-slot';
import * as fs from 'fs';
import * as path from 'path';
import { AdvanceTestSlot, Deployment, NonTestActivity, PersonalCommitment, TestSlot } from '@dvsa/mes-journal-schema';
import {ExaminerRecord} from '../../domain/examiner-record';
import {ExaminerPersonalCommitment} from '../../domain/examiner-personal-commitment';
import {ExaminerNonTestActivity} from '../../domain/examiner-non-test-activity';
import {ExaminerDeployment} from '../../domain/examiner-deployment';
import { ExaminerAdvanceTestSlot } from '../../domain/examiner-advance-test-slot';
import { addDays, subDays, format } from 'date-fns';

const journalsDir = path.join(process.cwd(), 'src/functions/pollJournals/application/__mocks__/journals');
const files = fs.readdirSync(journalsDir);

export function replaceTodayPlaceholders(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(replaceTodayPlaceholders);
  } else if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, replaceTodayPlaceholders(value)])
    );
  } else if (typeof obj === 'string') {
    // Match <TODAY>, <TODAY+n>, <TODAY-n>
    const match = obj.match(/^<TODAY(?:(\+|-)(\d+))?>T(\d{2}:\d{2}:\d{2})$/);
    if (match) {
      const [, sign, offsetStr, time] = match;
      const offset = offsetStr ? parseInt(offsetStr, 10) : 0;
      let date = new Date();
      if (sign === '+') date = addDays(date, offset);
      else if (sign === '-') date = subDays(date, offset);
      // Set time
      const [hours, minutes, seconds] = time.split(':').map(Number);
      date.setHours(hours, minutes, seconds, 0);
      return format(date, 'yyyy-MM-dd\'T\'HH:mm:ss');
    }
    return obj;
  }
  return obj;
}

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
  return replaceTodayPlaceholders(examinerRecords);
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
  return replaceTodayPlaceholders(examinerTestSlots);
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
  return replaceTodayPlaceholders(examinerPersonalCommitments);
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
  return replaceTodayPlaceholders(examinerNonTestActivities);
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
  return replaceTodayPlaceholders(examinerDeployments);

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
  return replaceTodayPlaceholders(examinerAdvanceTestSlots);

}

export async function getNextWorkingDayMock() {
  // For mock purposes, return today's date
  return new Date();
}
