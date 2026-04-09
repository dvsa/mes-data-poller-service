import type { ExaminerAdvanceTestSlot } from './examiner-advance-test-slot';
import type { ExaminerDeployment } from './examiner-deployment';
import type { ExaminerNonTestActivity } from './examiner-non-test-activity';
import type { ExaminerPersonalCommitment } from './examiner-personal-commitment';
import type { ExaminerTestSlot } from './examiner-test-slot';

export interface AllDatasets {
  testSlots: ExaminerTestSlot[];
  personalCommitments: ExaminerPersonalCommitment[];
  nonTestActivities: ExaminerNonTestActivity[];
  advanceTestSlots: ExaminerAdvanceTestSlot[];
  deployments: ExaminerDeployment[];
}
