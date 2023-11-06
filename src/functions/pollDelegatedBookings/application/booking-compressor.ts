import { gzipSync, gunzipSync } from 'zlib';
import { DelegatedExaminerTestSlot } from '../../pollJournals/domain/examiner-test-slot';

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
