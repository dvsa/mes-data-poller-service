import { ExaminerPersonalCommitment } from '../../../../domain/examiner-personal-commitment';

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
