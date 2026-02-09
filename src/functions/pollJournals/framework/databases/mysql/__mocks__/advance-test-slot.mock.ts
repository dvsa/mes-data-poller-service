import { ExaminerAdvanceTestSlot } from '../../../../domain/examiner-advance-test-slot';
import { info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { getMockJournalData } from '../../s3bucket/S3MockJournalsRepository';
import { isWithinInterval } from 'date-fns';

export const getMockAdvancedTestSlots = async (
  staffNumbers: number[],
  windowStart: Date,
  windowEnd: Date
): Promise<ExaminerAdvanceTestSlot[]> => {
  let slots: ExaminerAdvanceTestSlot[] = [];
  for (const staffNumber of staffNumbers) {
    {
      info('calling mock advancedTestSlots from s3', staffNumber.toString());
      let mockJournal: ExaminerAdvanceTestSlot[] = await getMockJournalData(
        staffNumber.toString(), 'advanceTestSlots'
      );
      info('called mock advancedTestSlots from s3', staffNumber.toString(), mockJournal);
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
  info('finished building advanced slots', slots);
  return slots;
};
