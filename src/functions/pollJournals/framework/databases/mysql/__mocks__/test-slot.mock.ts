import { ExaminerTestSlot } from '../../../../domain/examiner-test-slot';
import * as moment from 'moment/moment';

export const TARSTestSlotMock = (testSlotRun: number): ExaminerTestSlot[] => [
  {
    examinerId: 1,
    testSlot: {
      booking: {
        application: {
          applicationId: Number(`1${testSlotRun}`),
          bookingSequence: 1,
          checkDigit: 1,
          entitlementCheck: false,
          extendedTest: false,
          fitMarker: true,
          progressiveAccess: false,
          specialNeedsCode: 'NONE',
          specialNeedsExtendedTest: false,
          testCategory: 'B',
          vehicleGearbox: 'Automatic',
          welshTest: false,
          meetingPlace: 'Test Meeting Place.',
          categoryEntitlementCheck: false,
        },
        candidate: {
          candidateAddress: {
            addressLine1: 'Address Line 1',
            addressLine2: 'Address Line 2',
            addressLine3: 'Address Line 3',
            addressLine4: 'Address Line 4',
            addressLine5: 'Address Line 5',
            postcode: 'PO57 0DE',
          },
          candidateId: 9000,
          candidateName: {
            firstName: 'Firstname',
            lastName: 'Surname',
            title: 'Title',
          },
          driverNumber: 'SURNA123456789DO',
          mobileTelephone: '07111 123456',
          primaryTelephone: '01234 567890',
          secondaryTelephone: '04321 098765',
          dateOfBirth: '1977-07-02',
          ethnicityCode: 'D',
          gender: 'F',
        },
        previousCancellation: [
          'Act of nature',
        ],
      },
      slotDetail: {
        duration: 57,
        slotId: 1000,
        start: moment(Date.now()).format('YYYY-MM-DDTHH:mm:ss'),
      },
      testCentre: {
        centreId: 1,
        centreName: 'Test Centre 1',
        costCode: 'TC1',
      },
      vehicleTypeCode: 'C',
      vehicleSlotTypeCode: 7,
      examinerVisiting: false,
    },
  },
];
