import { ExaminerAdvanceTestSlot } from '../../../../domain/examiner-advance-test-slot';
import { debug } from '@dvsa/mes-microservice-common/application/utils/logger';
import { getMockJournalData } from '../../../../../../common/framework/s3bucket/S3MockJournalsRepository';
import { isWithinInterval } from 'date-fns';

export const getMockAdvancedTestSlots = async (
  staffNumbers: number[],
  windowStart: Date,
  windowEnd: Date
): Promise<ExaminerAdvanceTestSlot[]> => {
  let slots: ExaminerAdvanceTestSlot[] = [];
  debug('calling mock advancedTestSlots from s3');
  for (const staffNumber of staffNumbers) {
    {
      let mockJournal: ExaminerAdvanceTestSlot[] = await getMockJournalData(
        staffNumber.toString(), 'advanceTestSlots'
      );
      if (mockJournal) {
        // Remove any slots outside the date range
        mockJournal = mockJournal.filter((test: ExaminerAdvanceTestSlot) => {
          return isWithinInterval(new Date(test.advanceTestSlot.slotDetail.start), {
            start: windowStart,
            end: windowEnd,
          });
        });
        slots = slots.concat(mockJournal);
      }
    }
  }
  debug('finished building advanced slots', slots);
  return slots;
};
