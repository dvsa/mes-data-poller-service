import { mapRow } from '../non-test-activity-row-mapper';

describe('NonTestActivity Row Mapper', () => {

  it('should map a NonTestActivityRow to an ExaminerNonTestActivity', () => {
    const result = mapRow({
      individual_id: 1,
      slot_id: 2,
      start_time: new Date('2019-02-15 08:20:00'),
      minutes: 57,
      non_test_activity_code: 'activitycode',
      reason_desc: 'reason',
      tc_id: 3,
      tc_name: 'testcentre',
      tc_cost_centre_code: 'costcode',
    });
    expect(result).toEqual(
      {
        examinerId: 1,
        nonTestActivity: {
          activityCode: 'activitycode',
          activityDescription: 'reason',
          slotDetail: {
            duration: 57,
            slotId: 2,
            start: '2019-02-15T08:20:00',
          },
          testCentre: {
            centreId: 3,
            centreName: 'testcentre',
            costCode: 'costcode',
          },
        },
      },
    );
  });
});
