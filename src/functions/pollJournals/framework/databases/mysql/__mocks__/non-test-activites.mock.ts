import { ExaminerNonTestActivity } from '../../../../domain/examiner-non-test-activity';
import {info} from '@dvsa/mes-microservice-common/application/utils/logger';
import {getMockJournalData} from '../../s3bucket/S3MockJournalsRepository';

export const getMockNonTestActivites = async (staffNumbers: number[]): Promise<ExaminerNonTestActivity[]> => {
  let slots: ExaminerNonTestActivity[] = [];
  for (const staffNumber of staffNumbers) {
    {
      info('calling mock journal from s3', staffNumber.toString());
      const mockJournal: ExaminerNonTestActivity[] = await getMockJournalData(
        staffNumber.toString(), 'nonTestActivities'
      );
      info('called mock journal from s3', staffNumber.toString(), mockJournal);
      if (mockJournal) {
        slots = slots.concat(mockJournal);
      }
    }
  }
  return slots;
};

