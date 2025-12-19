import {ExaminerDeployment} from '../../../../domain/examiner-deployment';
import * as moment from 'moment/moment';

export const TARSDeploymentsMock: ExaminerDeployment[] = [
  {
    examinerId: 1,
    deployment: {
      deploymentId: 1,
      testCentre: {
        centreId: 1,
        centreName: 'Test Centre 1',
        costCode: 'TC1',
      },
      date: moment(Date.now()).format('YYYY-MM-DD'),
    },
  },
  {
    examinerId: 3,
    deployment: {
      deploymentId: 2,
      testCentre: {
        centreId: 2,
        centreName: 'Test Centre 2',
        costCode: 'TC2',
      },
      date: moment(Date.now()).format('YYYY-MM-DD'),
    },
  },
  {
    examinerId: 5,
    deployment: {
      deploymentId: 3,
      testCentre: {
        centreId: 3,
        centreName: 'Test Centre 3',
        costCode: 'TC3',
      },
      date: moment(Date.now()).format('YYYY-MM-DD'),
    },
  },
  {
    examinerId: 7,
    deployment: {
      deploymentId: 4,
      testCentre: {
        centreId: 4,
        centreName: 'Test Centre 4',
        costCode: 'TC4',
      },
      date: moment(Date.now()).format('YYYY-MM-DD'),
    },
  },
];
