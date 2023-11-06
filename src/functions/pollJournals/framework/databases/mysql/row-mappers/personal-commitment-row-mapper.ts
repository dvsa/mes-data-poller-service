import { ExaminerPersonalCommitment } from '../../../../domain/examiner-personal-commitment';

export interface PersonalCommitmentRow {
  individual_id: number;
  commitment_id: number;
  slot_id: number;
  non_test_activity_code: string;
  reason_desc: string;
}

export const mapRow = (row: PersonalCommitmentRow): ExaminerPersonalCommitment => {
  return {
    examinerId: +row.individual_id,
    personalCommitment: {
      commitmentId: +row.commitment_id,
      slotId: +row.slot_id,
      activityCode: row.non_test_activity_code,
      activityDescription: row.reason_desc,
    },
  };
};
