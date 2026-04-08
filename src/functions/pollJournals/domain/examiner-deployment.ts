import type { Deployment } from '@dvsa/mes-journal-schema';

export interface ExaminerDeployment {
  examinerId: number;
  deployment: Deployment;
}
