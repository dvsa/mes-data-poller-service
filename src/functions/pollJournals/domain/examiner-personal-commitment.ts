import type { PersonalCommitment } from '@dvsa/mes-journal-schema';

export interface ExaminerPersonalCommitment {
  examinerId: number;
  personalCommitment: PersonalCommitment;
}
