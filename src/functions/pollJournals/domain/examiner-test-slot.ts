import type { TestSlot } from '@dvsa/mes-journal-schema';

export interface ExaminerTestSlot {
  examinerId: number;
  testSlot: TestSlot;
}

export interface DelegatedExaminerTestSlot {
  examinerId: string;
  testSlot: TestSlot;
}
