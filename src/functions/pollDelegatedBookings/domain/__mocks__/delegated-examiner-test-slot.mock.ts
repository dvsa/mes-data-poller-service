import { gzipSync } from 'zlib';

export const mockOldDelegatedExaminerTestSlot = {
  examinerId: '44X4',
  testSlot: {
    slotDetail: {
      slotId: '35294121',
      start: '2020-10-30T07:51:00',
      extendedTest: false,
    },
    vehicleTypeCode: 'V4',
    vehicleSlotTypeCode: '122',
    booking: {
      candidate: {
        driverNumber: 'RED99908065W97NM',
        dateOfBirth: '1980-01-01',
        candidateId: '14042962',
        candidateName: {
          firstName: 'Dave',
          lastName: 'Gorman',
        },
      },
      application: {
        applicationId: '24306742',
        bookingSequence: 1,
        checkDigit: 0,
        testCategory: 'B+E',
      },
    },
    testCentre: {
      centreId: '3036',
      centreName: 'Test DA4',
      costCode: 'D1234',
    },
  },
};

export const compressedMockOldDelegatedExaminerTestSlot = gzipSync(
  Buffer.from(JSON.stringify(mockOldDelegatedExaminerTestSlot))
);

export const mockNewDelegatedExaminerTestSlot = {
  examinerId: '44X4',
  testSlot: {
    slotDetail: {
      slotId: '35294121',
      start: '2020-12-30T07:51:00',
      extendedTest: false,
    },
    vehicleTypeCode: 'V4',
    vehicleSlotTypeCode: '122',
    booking: {
      candidate: {
        driverNumber: 'BLU99912312F49SA',
        dateOfBirth: '1980-01-01',
        candidateId: '14042962',
        candidateName: {
          firstName: 'Dave',
          lastName: 'Gorman',
        },
      },
      application: {
        applicationId: '24306712',
        bookingSequence: 7,
        checkDigit: 0,
        testCategory: 'B+E',
      },
    },
    testCentre: {
      centreId: '3036',
      centreName: 'Test DA4',
      costCode: 'D1234',
    },
  },
};

export const compressedMockNewDelegatedExaminerTestSlot = gzipSync(
  Buffer.from(JSON.stringify(mockNewDelegatedExaminerTestSlot))
);
