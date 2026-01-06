import * as moment from 'moment/moment';
import { ExaminerNonTestActivity } from '../../../../domain/examiner-non-test-activity';

export const TARSNonTestActivitesMock: ExaminerNonTestActivity[] = [
  {
    examinerId: 1,
    nonTestActivity: {
      slotDetail: {
        slotId: 100,
        start: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        duration: 57,
      },
      activityCode: '100',
      activityDescription: 'Non Test Activity 100',
      testCentre: {
        centreId: 1,
        centreName: 'Test Centre 1',
        costCode: 'TC1',
      },
    },
  },
  {
    examinerId: 3,
    nonTestActivity: {
      slotDetail: {
        slotId: 101,
        start: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        duration: 57,
      },
      activityCode: '101',
      activityDescription: 'Non Test Activity 101',
      testCentre: {
        centreId: 2,
        centreName: 'Test Centre 2',
        costCode: 'TC2',
      },
    },
  },
  {
    examinerId: 1,
    nonTestActivity: {
      slotDetail: {
        slotId: 102,
        start: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        duration: 57,
      },
      activityCode: '102',
      activityDescription: 'Non Test Activity 102',
      testCentre: {
        centreId: 3,
        centreName: 'Test Centre 3',
        costCode: 'TC3',
      },
    },
  },
  {
    examinerId: 1,
    nonTestActivity: {
      slotDetail: {
        slotId: 100,
        start: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        duration: 57,
      },
      activityCode: '100',
      activityDescription: 'Non Test Activity 100',
      testCentre: {
        centreId: 1,
        centreName: 'Test Centre 1',
        costCode: 'TC1',
      },
    },
  },
];
