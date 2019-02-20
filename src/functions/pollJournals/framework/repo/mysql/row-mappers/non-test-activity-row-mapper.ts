import { ExaminerNonTestActivity } from '../../../../domain/examiner-non-test-activity';

interface NonTestActivityRow {
  individual_id: number;
  slot_id: number;
  start_time: string;
  minutes: number;
  non_test_activity_code: string;
  reason_desc: string;
  tc_id: number;
  tc_name: string;
  tc_cost_centre_code: string;
}

export const mapRow = (row: NonTestActivityRow): ExaminerNonTestActivity => {
  return {
    examinerId: row.individual_id,
    nonTestActivity: {
      slotDetail: {
        slotId: row.slot_id,
        start: row.start_time,
        duration: row.minutes,
      },
      activityCode: row.non_test_activity_code,
      activityDescription: row.reason_desc,
      testCentre: {
        centreId: row.tc_id,
        centreName: row.tc_name,
        costCode: row.tc_cost_centre_code,
      },
    },
  };
};
