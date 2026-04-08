import type { ExaminerWorkSchedule } from '@dvsa/mes-journal-schema';
import { gzipSync } from 'zlib';

export const compressJournal = (journal: ExaminerWorkSchedule): Buffer => {
  return gzipSync(JSON.stringify(journal));
};
