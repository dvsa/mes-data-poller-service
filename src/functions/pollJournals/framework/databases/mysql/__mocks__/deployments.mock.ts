import { ExaminerDeployment } from '../../../../domain/examiner-deployment';
import { info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { getMockJournalData } from '../../s3bucket/S3MockJournalsRepository';

export const getMockDeployments = async (staffNumbers: number[]): Promise<ExaminerDeployment[]> => {
  let slots: ExaminerDeployment[] = [];
  for (const staffNumber of staffNumbers) {
    {
      info('calling mock journal from s3', staffNumber.toString());
      const mockJournal = await getMockJournalData(
        staffNumber.toString(), 'deployments'
      );
      info('called mock journal from s3', staffNumber.toString(), mockJournal);
      if (mockJournal) {
        slots = slots.concat(mockJournal);
      }
    }
  }
  return slots;
};
