import { DelegatedBookingDetail } from '../../../../../../common/application/models/delegated-booking-details';
import * as compressor from '../../../../application/booking-compressor';
import { buildDelegatedBookingsFromQueryResult } from '../delegated-examiner-bookings-row-mapper';
import { mockDelegatedBookingRows } from './delegated-examiner-bookings-row-mapper.mock';

const bufferStr: Buffer = Buffer.from('some stringified data');

describe('DelegatedBookingsMapper', () => {
  beforeEach(() => {
    spyOn(compressor, 'compressDelegatedBooking').and.returnValue(bufferStr);
  });
  it('should map the first row from the query', () => {
    expect(buildDelegatedBookingsFromQueryResult(mockDelegatedBookingRows)[0]).toEqual(
      new DelegatedBookingDetail(41234567021, '1234567', bufferStr)
    );
  });
  it('should map the second row from the query', () => {
    expect(buildDelegatedBookingsFromQueryResult(mockDelegatedBookingRows)[1]).toEqual(
      new DelegatedBookingDetail(41234568034, '4583912', bufferStr)
    );
  });
  it('should map the third row from the query', () => {
    expect(buildDelegatedBookingsFromQueryResult(mockDelegatedBookingRows)[2]).toEqual(
      new DelegatedBookingDetail(41234569053, '2468053', bufferStr)
    );
  });
  it('should map the fourth row from the query', () => {
    expect(buildDelegatedBookingsFromQueryResult(mockDelegatedBookingRows)[3]).toEqual(
      new DelegatedBookingDetail(41234561064, '9865321', bufferStr)
    );
  });
});
