import { info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { isWithinInterval } from 'date-fns';
import { getMockJournalData } from '../../../../../../common/framework/s3bucket/S3MockJournalsRepository';
import type { ExaminerTestSlot } from '../../../../domain/examiner-test-slot';
import type { ScheduleBookingsRow } from '../test-slot-repository-des-schedule';

export const getMockTestSlots = async (
  staffNumbers: number[],
  startDate: Date,
  endDate: Date
): Promise<ExaminerTestSlot[]> => {
  let testSlots: ExaminerTestSlot[] = [];
  for (const staffNumber of staffNumbers) {
    {
      info('calling mock test slots from s3', staffNumber.toString());
      let mockJournal: ExaminerTestSlot[] = await getMockJournalData(staffNumber.toString(), 'testSlots');
      if (mockJournal) {
        // Remove any slots outside the date range
        mockJournal = mockJournal.filter((test: ExaminerTestSlot) => {
          return isWithinInterval(new Date(test.testSlot.slotDetail.start), {
            start: startDate,
            end: endDate,
          });
        });
        testSlots = testSlots.concat(mockJournal);
      }
    }
  }
  return testSlots;
};

export const getMockDSPBookings = async (
  staffNumbers: number[],
  startDate: Date,
  endDate: Date
): Promise<ScheduleBookingsRow[]> => {
  let bookings: ScheduleBookingsRow[] = [];
  for (const staffNumber of staffNumbers) {
    {
      info('calling mock dsp bookings from s3', staffNumber.toString());
      let mockJournal: ScheduleBookingsRow[] = await getMockJournalData(staffNumber.toString(), 'DSPBookings');
      if (mockJournal) {
        // Remove any slots outside the date range
        mockJournal = mockJournal.filter((test: ScheduleBookingsRow) => {
          return isWithinInterval(new Date(test.testslotStart), {
            start: startDate,
            end: endDate,
          });
        });
        bookings = bookings.concat(mockJournal);
      }
    }
  }
  return bookings;
};
