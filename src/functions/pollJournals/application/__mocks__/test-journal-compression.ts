import { VehicleGearbox, Initiator, ExaminerWorkSchedule } from '@dvsa/mes-journal-schema';

export default {
  journal: {
    testSlots: [
      {
        booking: {
          application: {
            applicationId: 1234567,
            bookingSequence: 3,
            checkDigit: 1,
            entitlementCheck: false,
            extendedTest: false,
            progressiveAccess: false,
            specialNeeds: 'Candidate has dyslexia',
            testCategory: 'A1',
            vehicleGearbox: 'Automatic' as VehicleGearbox,
            welshTest: false,
          },
          candidate: {
            candidateAddress: {
              addressLine1: '1 Station Street',
              addressLine2: 'Someplace',
              addressLine3: 'Sometown',
              postcode: 'AB12 3CD',
            },
            candidateId: 101,
            candidateName: {
              firstName: 'Florence',
              lastName: 'Pearson',
              title: 'Miss',
            },
            driverNumber: 'PEARS015220A99HC',
            mobileTelephone: '07654 123456',
            primaryTelephone: '01234 567890',
            secondaryTelephone: '04321 098765',
          },
          previousCancellation: [
            'Act of nature',
          ] as Initiator[],
        },
        slotDetail: {
          duration: 57,
          slotId: 1001,
          start: '2018-12-10T08:10:00+00:00',
        },
        testCentre: {
          centreId: 54321,
          centreName: 'Example Test Centre',
          costCode: 'EXTC1',
        },
        vehicleTypeCode: 'A2',
      },
    ],
  } as ExaminerWorkSchedule,
};
