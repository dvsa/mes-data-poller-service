import type { DelegatedExaminerTestSlot } from '../../../pollJournals/domain/examiner-test-slot';
import { compressDelegatedBooking } from '../booking-compressor';

describe('DelegatedBookingCompressor', () => {
  describe('compressDelegatedBooking', () => {
    it('should gzip the journal JSON and return a base64 encoded version', () => {
      const booking: DelegatedExaminerTestSlot = {
        examinerId: '1234254',
        testSlot: {
          slotDetail: null,
          vehicleTypeCode: 'B',
          vehicleSlotTypeCode: 1,
          booking: {},
          testCentre: {
            centreId: 1,
            centreName: 'test centre',
            costCode: 'cost code',
          },
        },
      };
      const compressedDelegatedBooking = compressDelegatedBooking(booking);
      expect(compressedDelegatedBooking.byteLength).toBeLessThan(Buffer.from(JSON.stringify(booking)).byteLength);
    });
  });
});
