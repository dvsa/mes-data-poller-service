import { debug } from '@dvsa/mes-microservice-common/application/utils/logger';
import { isWithinInterval } from 'date-fns';
import { getMockJournalData } from '../../../../../../common/framework/s3bucket/S3MockJournalsRepository';
import type { ExaminerNonTestActivity } from '../../../../domain/examiner-non-test-activity';

export const getMockNonTestActivities = async (
  staffNumbers: number[],
  startDate: Date,
  endDate: Date
): Promise<ExaminerNonTestActivity[]> => {
  let slots: ExaminerNonTestActivity[] = [];

  debug('calling mock non-tests from s3');
  for (const staffNumber of staffNumbers) {
    {
      let mockJournal: ExaminerNonTestActivity[] = await getMockJournalData(
        staffNumber.toString(),
        'nonTestActivities'
      );
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

  debug('called mock non-tests from s3', slots);
  return slots;
};
