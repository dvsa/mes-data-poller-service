import { ExaminerAdvanceTestSlot } from '../../../../domain/examiner-advance-test-slot';
import { info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { getMockJournalData } from '../../s3bucket/S3MockJournalsRepository';

export const getMockNonTestActivites = async (staffNumbers: number[]): Promise<ExaminerAdvanceTestSlot[]> => {
  const slots: ExaminerAdvanceTestSlot[] = [];
  for (const staffNumber of staffNumbers) {
    {
      info('calling mock journal from s3', staffNumber.toString());
      const mockJournal: ExaminerAdvanceTestSlot[] = await getMockJournalData(
        staffNumber.toString(), 'advanceTestSlots'
      );
      info('called mock journal from s3', staffNumber.toString(), mockJournal);
      if (mockJournal) {
        slots.concat(mockJournal);
      }
    }
  }
  return slots;
};
