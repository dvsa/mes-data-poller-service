import { ExaminerPersonalCommitment } from '../../../../domain/examiner-personal-commitment';
import { info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { getMockJournalData } from '../../s3bucket/S3MockJournalsRepository';

export const getMockPersonalCommitments = async (staffNumbers: number[]): Promise<ExaminerPersonalCommitment[]> => {
  let slots: ExaminerPersonalCommitment[] = [];
  for (const staffNumber of staffNumbers) {
    {
      info('calling mock personalCommitment from s3', staffNumber.toString());
      const mockJournal: ExaminerPersonalCommitment[] = await getMockJournalData(
        staffNumber.toString(), 'personalCommitments'
      );
      info('called mock personalCommitment from s3', staffNumber.toString(), mockJournal);
      if (mockJournal) {
        slots = slots.concat(mockJournal);
      }
    }
  }
  return slots;
};
