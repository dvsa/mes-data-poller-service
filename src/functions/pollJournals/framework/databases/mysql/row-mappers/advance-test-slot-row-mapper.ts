import { ExaminerAdvanceTestSlot } from '../../../../domain/examiner-advance-test-slot';
import { formatDateToStartTime } from '../../../../application/formatters/date-formatter';

export interface AdvanceTestSlotRow {
  individual_id: number;
  slot_id: number;
  start_time: Date;
  minutes: number;
  tc_id: number;
  tc_name: string;
  tc_cost_centre_code: string;
  vehicle_type_code: string;
}

export const mapRow = (row: AdvanceTestSlotRow): ExaminerAdvanceTestSlot => {
  return {
    examinerId: row.individual_id,
    advanceTestSlot: {
      slotDetail: {
        slotId: row.slot_id,
        start: formatDateToStartTime(row.start_time),
        duration: row.minutes,
      },
      testCentre: {
        centreId: row.tc_id,
        centreName: row.tc_name,
        costCode: row.tc_cost_centre_code,
      },
      vehicleTypeCode: row.vehicle_type_code,
    },
  };
};
