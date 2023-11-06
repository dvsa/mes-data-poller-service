import { mapRow } from '../personal-commitment-row-mapper';

describe('PersonalCommitment Row Mapper', () => {
  it('should map a PersonalCommitmentRow to an ExaminerPersonalCommitment', () => {
    const result = mapRow({
      individual_id: 1,
      commitment_id: 2,
      slot_id: 3,
      non_test_activity_code: 'pcom',
      reason_desc: 'reason',
    });
    expect(result).toEqual(
      {
        examinerId: 1,
        personalCommitment: {
          activityCode: 'pcom',
          activityDescription: 'reason',
          commitmentId: 2,
          slotId: 3,
        },
      },
    );
  });
});
