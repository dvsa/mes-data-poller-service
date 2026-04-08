import type { NonTestActivity } from '@dvsa/mes-journal-schema';

export interface ExaminerNonTestActivity {
  examinerId: number;
  nonTestActivity: NonTestActivity;
}
