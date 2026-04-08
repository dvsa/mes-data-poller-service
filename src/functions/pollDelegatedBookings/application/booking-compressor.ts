import { gunzipSync, gzipSync } from 'zlib';
import type { DelegatedExaminerTestSlot } from '../../pollJournals/domain/examiner-test-slot';

export const compressDelegatedBooking = (examinerBookingDetail: DelegatedExaminerTestSlot): Buffer => {
  try {
    return gzipSync(JSON.stringify(examinerBookingDetail));
  } catch (err) {
    throw err;
  }
};

export const decompressDelegatedBooking = (examinerBookingDetailBuffer: Buffer): DelegatedExaminerTestSlot => {
  try {
    const booking = gunzipSync(examinerBookingDetailBuffer).toString();
    return JSON.parse(booking);
  } catch (err) {
    throw err;
  }
};
