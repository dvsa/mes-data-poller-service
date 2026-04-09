export class DelegatedBookingDetail {
  applicationReference: number;
  staffNumber: string;
  bookingDetail: Buffer;

  constructor(applicationReference: number, staffNumber: string, bookingDetail: Buffer) {
    this.applicationReference = applicationReference;
    this.staffNumber = staffNumber;
    this.bookingDetail = bookingDetail;
  }
}
