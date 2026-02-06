import { ExaminerNonTestActivity } from '../../../../domain/examiner-non-test-activity';
import { info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { getMockJournalData } from '../../s3bucket/S3MockJournalsRepository';
import { isWithinInterval } from 'date-fns';

export const getMockNonTestActivities = async (
  staffNumbers: number[],
  startDate: Date,
  endDate: Date
): Promise<ExaminerNonTestActivity[]> => {
  let slots: ExaminerNonTestActivity[] = [];
  for (const staffNumber of staffNumbers) {
    {
      info('calling mock journal from s3', staffNumber.toString());
      let mockJournal: ExaminerNonTestActivity[] = await getMockJournalData(
        staffNumber.toString(), 'nonTestActivities'
      );
      info('called mock journal from s3', staffNumber.toString(), mockJournal);
      if (mockJournal) {
        // Remove any slots outside the date range
        mockJournal = mockJournal.filter((test: ExaminerNonTestActivity) => {
          return isWithinInterval(new Date(test.nonTestActivity.slotDetail.start), {
            start: startDate,
            end: endDate,
          });
        });
        slots = slots.concat(mockJournal);
      }
    }
  }
  return slots;
};

