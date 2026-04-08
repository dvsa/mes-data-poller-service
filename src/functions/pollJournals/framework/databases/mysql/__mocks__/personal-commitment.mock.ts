import { debug } from '@dvsa/mes-microservice-common/application/utils/logger';
import { getMockJournalData } from '../../../../../../common/framework/s3bucket/S3MockJournalsRepository';
import type { ExaminerPersonalCommitment } from '../../../../domain/examiner-personal-commitment';

export const getMockPersonalCommitments = async (staffNumbers: number[]): Promise<ExaminerPersonalCommitment[]> => {
  let slots: ExaminerPersonalCommitment[] = [];
  debug('calling mock personalCommitment from s3');
  for (const staffNumber of staffNumbers) {
    {
      const mockJournal: ExaminerPersonalCommitment[] = await getMockJournalData(
        staffNumber.toString(),
        'personalCommitments'
      );
      if (mockJournal) {
        slots = slots.concat(mockJournal);
      }
    }
  }
  debug('called mock personalCommitment from s3', slots);
  return slots;
};
