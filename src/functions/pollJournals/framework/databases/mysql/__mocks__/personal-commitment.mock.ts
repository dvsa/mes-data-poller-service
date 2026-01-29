import { ExaminerPersonalCommitment } from '../../../../domain/examiner-personal-commitment';
import { ExaminerTestSlot } from '../../../../domain/examiner-test-slot';
import { info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { getMockJournalData } from '../../s3bucket/S3MockJournalsRepository';

export const TARSPersonalCommitmentMock: ExaminerPersonalCommitment[] = [
  {
    examinerId: 1,
    personalCommitment: {
      commitmentId: 1,
      slotId: 1,
      activityCode: '1',
      activityDescription: 'Personal Commitment 1',
    },
  },
  {
    examinerId: 3,
    personalCommitment: {
      commitmentId: 2,
      slotId: 2,
      activityCode: '2',
      activityDescription: 'Personal Commitment 2',
    },
  },
  {
    examinerId: 5,
    personalCommitment: {
      commitmentId: 3,
      slotId: 3,
      activityCode: '3',
      activityDescription: 'Personal Commitment 3',
    },
  },
  {
    examinerId: 7,
    personalCommitment: {
      commitmentId: 4,
      slotId: 4,
      activityCode: '4',
      activityDescription: 'Personal Commitment 4',
    },
  },
];

export const getMockPersonalCommitments = async (staffNumbers: number[]): Promise<ExaminerPersonalCommitment[]> => {
  let slots: ExaminerPersonalCommitment[] = [];
  for (const staffNumber of staffNumbers) {
    {
      info('calling mock journal from s3', staffNumber.toString());
      const mockJournal: ExaminerPersonalCommitment[] = await getMockJournalData(
        staffNumber.toString(), 'personalCommitments'
      );
      info('called mock journal from s3', staffNumber.toString(), mockJournal);
      if (mockJournal) {
        slots = slots.concat(mockJournal);
      }
    }
  }
  return slots;
};
