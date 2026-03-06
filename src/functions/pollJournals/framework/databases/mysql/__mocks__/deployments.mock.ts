import { ExaminerDeployment } from '../../../../domain/examiner-deployment';
import { debug } from '@dvsa/mes-microservice-common/application/utils/logger';
import { getMockJournalData } from '../../../../../../common/framework/s3bucket/S3MockJournalsRepository';
import { isWithinInterval } from 'date-fns';

export const getMockDeployments = async (
  staffNumbers: number[],
  startDate: Date,
  endDate: Date,
): Promise<ExaminerDeployment[]> => {
  let slots: ExaminerDeployment[] = [];
  debug('calling mock deployments from s3');
  for (const staffNumber of staffNumbers) {
    {
      let mockJournal = await getMockJournalData(
        staffNumber.toString(), 'deployments'
      );
      if (mockJournal) {
        // Remove any slots outside the date range
        mockJournal = mockJournal.filter((test: ExaminerDeployment) => {
          return isWithinInterval(new Date(test.deployment.date), {
            start: startDate,
            end: endDate,
          });
        });
        slots = slots.concat(mockJournal);
      }
    }
  }
  debug('called mock deployments from s3', slots);
  return slots;
};
