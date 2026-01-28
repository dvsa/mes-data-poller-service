import * as moment from 'moment/moment';
import { ExaminerAdvanceTestSlot } from '../../../../domain/examiner-advance-test-slot';
import { info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { getMockJournalData } from '../../s3bucket/S3MockJournalsRepository';

export const TARSAdvanceTestSlotMock: ExaminerAdvanceTestSlot[] = [
  {
    examinerId: 1,
    advanceTestSlot: {
      slotDetail: {
        slotId: 200,
        start: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        duration: 57,
      },
      testCentre: {
        centreId: 1,
        centreName: 'Test Centre 1',
        costCode: 'TC1',
      },
      vehicleTypeCode: 'VT1',
    },
  },
  {
    examinerId: 3,
    advanceTestSlot: {
      slotDetail: {
        slotId: 201,
        start: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        duration: 57,
      },
      testCentre: {
        centreId: 2,
        centreName: 'Test Centre 2',
        costCode: 'TC2',
      },
      vehicleTypeCode: 'VT2',
    },
  },
  {
    examinerId: 5,
    advanceTestSlot: {
      slotDetail: {
        slotId: 202,
        start: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        duration: 57,
      },
      testCentre: {
        centreId: 3,
        centreName: 'Test Centre 3',
        costCode: 'TC3',
      },
      vehicleTypeCode: 'VT3',
    },
  },
  {
    examinerId: 7,
    advanceTestSlot: {
      slotDetail: {
        slotId: 203,
        start: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        duration: 57,
      },
      testCentre: {
        centreId: 4,
        centreName: 'Test Centre 4',
        costCode: 'TC4',
      },
      vehicleTypeCode: 'VT4',
    },
  },
];

export const getMockNonTestActivites = async (staffNumbers: number[]): Promise<ExaminerAdvanceTestSlot[]> => {
  const testSlots: ExaminerAdvanceTestSlot[] = [];
  for (const staffNumber of staffNumbers) {
    {
      info('calling mock journal from s3', staffNumber.toString());
      const mockJournal = await getMockJournalData(staffNumber.toString(), 'advanceTestSlots');
      info('called mock journal from s3', staffNumber.toString(), mockJournal);
      if (mockJournal) {
        testSlots.push(mockJournal);
      }
    }
  }
  return testSlots;
};
