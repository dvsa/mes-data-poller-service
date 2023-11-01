import { mapRow } from '../advance-test-slot-row-mapper';

describe('AdvanceTestSlot Row Mapper', () => {

  it('should map an AdvanceTestSlot row to an ExaminerAdvanceTestSlot', () => {
    const result = mapRow({
      individual_id: 1,
      slot_id: 123,
      start_time: new Date('2019-02-12 08:20:00'),
      minutes: 100,
      tc_id: 3,
      tc_name: 'test-tc',
      tc_cost_centre_code: 'csc',
      vehicle_type_code: '6',
    });
    expect(result).toEqual(
      {
        examinerId: 1,
        advanceTestSlot: {
          slotDetail: {
            slotId: 123,
            start: '2019-02-12T08:20:00',
            duration: 100,
          },
          testCentre: {
            centreId: 3,
            centreName: 'test-tc',
            costCode: 'csc',
          },
          vehicleTypeCode: '6',
        },
      },
    );
  });
});
