import { ExaminerTestSlot } from '../../../../domain/examiner-test-slot';
import {
  Application,
  Booking,
  Business,
  Candidate,
  PreviousCancellation,
  Address,
} from '@dvsa/mes-journal-schema';
import { formatDateToStartTime, formatDateToIso8601 } from '../../../../application/formatters/date-formatter';
import { error } from '@dvsa/mes-microservice-common/application/utils/logger';

/**
 * Defines the possible rows that the test slot query can return.
 *
 * Whether a field is nullable or not depends both on the table definition and whether being accessed
 * via a left join.
 *
 * This needs updating if the SQL query is ever changed.
 */
interface TestSlotRow {
  slot_id: number; // not nullable
  start_time: Date; // not nullable
  minutes: number; // not nullable
  vehicle_type_code: string | null; // nullable
  vehicle_slot_type_code: number | null; // nullable
  tc_id: number; // not nullable
  tc_cost_centre_code: string; // not nullable
  tc_name: string; // not nullable
  individual_id: number; // not nullable
  programme_date: string; // not nullable
  // every field beyond this point is nullable because of the left join on booking_details...
  booking_id: number | null;
  app_id: number;
  booking_seq: number;
  check_digit: number;
  welsh_test_ind: number | null;
  ext_req_ind: number | null;
  progressive_access: number | null;
  meeting_place: string | null;
  special_needs: string | null;
  special_needs_extended_test: number | null;
  special_needs_code: string | null;
  ent_check_ind: number | null;
  cab_seat_count: number | null;
  passenger_seat_count: number | null;
  height_metres: number | null;
  length_metres: number | null;
  width_metres: number | null;
  vehicle_category: string | null;
  gearbox_type: number | null;
  candidate_id: number | null;
  candidate_title: string | null;
  candidate_first_name: string | null;
  candidate_second_name: string | null;
  candidate_third_name: string | null;
  candidate_surname: string | null;
  candidate_driver_number: string | null;
  candidate_date_of_birth: Date | null;
  candidate_gender_code: string | null;
  candidate_ethnicity_code: string | null;
  cand_primary_tel_ind: number | null;
  cand_primary_tel: string | null;
  cand_secondary_tel_ind: number | null;
  cand_secondary_tel: string | null;
  cand_mobile_tel_ind: number | null;
  cand_mobile_tel: string | null;
  cand_email: string | null;
  candidate_addr_line1: string | null;
  candidate_addr_line2: string | null;
  candidate_addr_line3: string | null;
  candidate_addr_line4: string | null;
  candidate_addr_line5: string | null;
  candidate_post_code: string | null;
  candidate_prn: number | null;
  prev_attempts: number | null;
  business_id: number | null;
  business_name: string | null;
  business_addr_line1: string | null;
  business_addr_line2: string | null;
  business_addr_line3: string | null;
  business_addr_line4: string | null;
  business_addr_line5: string | null;
  business_post_code: string | null;
  business_telephone: string | null;
  cancel_initiator: string | null;
  examiner_deployed_to_from_code: number | null;
}

/**
 * Marshalls test slot query results into the JSON representation.
 * @param row The query results
 * @returns The JSON representation
 */
export const mapRow = (row: TestSlotRow): ExaminerTestSlot => {
  // populate not nullable fields...
  const slot: ExaminerTestSlot = {
    examinerId: row.individual_id,
    testSlot: {
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
      examinerVisiting: row.examiner_deployed_to_from_code === 0,
    },
  };

  // ...then add the nullable fields, if returned in results
  if (row.vehicle_type_code) {
    slot.testSlot.vehicleTypeCode = row.vehicle_type_code;
  }

  if (row.vehicle_slot_type_code) {
    slot.testSlot.vehicleSlotTypeCode = row.vehicle_slot_type_code;
  }

  if (row.booking_id) {
    const booking: Booking = {};
    slot.testSlot.booking = booking;

    const app: Application = { applicationId: 0, bookingSequence: 0, checkDigit: 0 };
    booking.application = app;
    setNumberIfTruthy(app, 'applicationId', row.app_id);
    setNumberIfTruthy(app, 'bookingSequence', row.booking_seq);
    setNumberIfNotNull(app, 'checkDigit', row.check_digit);
    setBooleanIfPopulated(app, 'welshTest', row.welsh_test_ind);
    setBooleanIfPopulated(app, 'extendedTest', row.ext_req_ind);
    setStringIfPopulated(app, 'meetingPlace', row.meeting_place);
    setBooleanIfPopulated(app, 'progressiveAccess', row.progressive_access);
    setStringIfPopulated(app, 'specialNeeds', row.special_needs);
    setBooleanIfPopulated(app, 'specialNeedsExtendedTest', row.special_needs_extended_test);
    setStringIfPopulated(app, 'specialNeedsCode', row.special_needs_code);
    setBooleanIfPopulated(app, 'entitlementCheck', row.ent_check_ind);
    setNumberIfTruthy(app, 'vehicleSeats', zeroIfNull(row.cab_seat_count) + zeroIfNull(row.passenger_seat_count));
    setNumberIfTruthy(app, 'vehicleHeight', row.height_metres);
    setNumberIfTruthy(app, 'vehicleWidth', row.width_metres);
    setNumberIfTruthy(app, 'vehicleLength', row.length_metres);
    setStringIfPopulated(app, 'testCategory', row.vehicle_category);

    if (row.gearbox_type) {
      switch (row.gearbox_type) {
      case 1:
        app.vehicleGearbox = 'Manual';
        break;

      case 2:
        app.vehicleGearbox = 'Automatic';
        break;

      case 3:
        app.vehicleGearbox = 'Semi-Automatic';
        break;

      default:
        error(`Invalid Gearbox Code ${row.gearbox_type} for app id ${row.app_id}`);
      }
    }

    if (row.candidate_id) {
      const candidate: Candidate = {
        candidateId: row.candidate_id,
      };
      slot.testSlot.booking.candidate = candidate;
      setStringIfPopulated(candidate, 'driverNumber', row.candidate_driver_number);

      if (row.cand_primary_tel_ind === 1) {
        setStringIfPopulated(candidate, 'primaryTelephone', row.cand_primary_tel);
      }
      if (row.cand_secondary_tel_ind === 1) {
        setStringIfPopulated(candidate, 'secondaryTelephone', row.cand_secondary_tel);
      }
      if (row.cand_mobile_tel_ind === 1) {
        setStringIfPopulated(candidate, 'mobileTelephone', row.cand_mobile_tel);
      }

      setStringIfPopulated(candidate, 'emailAddress', row.cand_email);
      setNumberIfTruthy(candidate, 'prn', row.candidate_prn);
      setNumberIfTruthy(candidate, 'previousADITests', row.prev_attempts);
      setStringIfPopulated(candidate, 'dateOfBirth', formatDateToIso8601(row.candidate_date_of_birth));
      setStringIfPopulated(candidate, 'ethnicityCode', row.candidate_ethnicity_code);
      setGenderIfPopulated(candidate, row.candidate_gender_code);

      candidate.candidateName = {};
      setCapitalisedStringIfPopulated(candidate.candidateName, 'title', row.candidate_title);
      setCapitalisedStringIfPopulated(candidate.candidateName, 'firstName', row.candidate_first_name);
      setCapitalisedStringIfPopulated(candidate.candidateName, 'secondName', row.candidate_second_name);
      setCapitalisedStringIfPopulated(candidate.candidateName, 'thirdName', row.candidate_third_name);
      setCapitalisedStringIfPopulated(candidate.candidateName, 'lastName', row.candidate_surname);

      setAddressIfPopulated(
        candidate, 'candidateAddress', row.candidate_addr_line1, row.candidate_addr_line2, row.candidate_addr_line3,
        row.candidate_addr_line4, row.candidate_addr_line5, row.candidate_post_code);
    }

    if (row.cancel_initiator && row.cancel_initiator.length > 0) {
      booking.previousCancellation = row.cancel_initiator.split(',') as PreviousCancellation;
    }

    if (row.business_id) {
      const business: Business = {
        businessId: row.business_id,
      };
      booking.business = business;
      setStringIfPopulated(business, 'businessName', row.business_name);
      setStringIfPopulated(business, 'telephone', row.business_telephone);
      setAddressIfPopulated(
        business, 'businessAddress', row.business_addr_line1, row.business_addr_line2, row.business_addr_line3,
        row.business_addr_line4, row.business_addr_line5, row.business_post_code);
    }
  }

  return slot;
};

/**
 * Sets address fields if the values are populated (not null and not empty). Always creates the wrapper Address object.
 * @param object The object to update
 * @param field  The object field to set
 * @param line1  The address line 1 value to use
 * @param line2  The address line 2 value to use
 * @param line3  The address line 3 value to use
 * @param line4  The address line 4 value to use
 * @param line5  The address line 5 value to use
 * @param postcode  The address postcode value to use
 */
function setAddressIfPopulated<T>(
  object: T,
  field: keyof T,
  line1: string | null,
  line2: string | null,
  line3: string | null,
  line4: string | null,
  line5: string | null,
  postcode: string | null) {
  const address: Address = {};
  object[field as string] = address;
  setStringIfPopulated(address, 'addressLine1', line1);
  setStringIfPopulated(address, 'addressLine2', line2);
  setStringIfPopulated(address, 'addressLine3', line3);
  setStringIfPopulated(address, 'addressLine4', line4);
  setStringIfPopulated(address, 'addressLine5', line5);
  setStringIfPopulated(address, 'postcode', postcode);
}

/**
 * Sets an object field if the value is truthy.
 * @param object The object to update
 * @param field  The object field to set
 * @param value  The value to use
 */
export function setNumberIfTruthy<T>(object: T, field: keyof T, value: number | null) {
  if (value) {
    object[field as string] = value;
  }
}

/**
 * Sets an object field if the value is not null.
 * @param object The object to update
 * @param field  The object field to set
 * @param value  The value to use
 */
export function setNumberIfNotNull<T>(object: T, field: keyof T, value: number | null) {
  if (value !== null) {
    object[field as string] = value;
  }
}

/**
 * Sets an object field to true (if the value is 1), otherwise set to false.
 * @param object The object to update
 * @param field  The object field to set
 * @param value  The value to use (0 or 1 meaning true or false)
 */
function setBooleanIfPopulated<T>(object: T, field: keyof T, value: number | null) {
  if (value) {
    object[field as string] = (value === 1);
  } else {
    object[field as string] = false;
  }
}

/**
 * Sets an object field if the value is populated (not null and not empty or just whitespace).
 * @param object The object to update
 * @param field  The object field to set
 * @param value  The value to use
 */
export function setStringIfPopulated<T>(object: T, field: keyof T, value: string | null) {
  if (value && value.trim().length > 0) {
    object[field as string] = value;
  }
}

/**
 * Sets an object field with an initial capital letter, if the value is populated (not null and not empty
 * or just whitespace).
 * @param object The object to update
 * @param field  The object field to set
 * @param value  The value to use
 */
export function setCapitalisedStringIfPopulated<T>(object: T, field: keyof T, value: string | null) {
  if (value && value.trim().length > 0) {
    object[field as string] = value.charAt(0).toUpperCase() + value.slice(1);
  }
}

/**
 * Returns the value (if not null) otherwise zero.
 * @param value The value to use
 */
const zeroIfNull = (value: number | null): number => {
  return value ? value : 0;
};

/**
 * The codes that TARS uses to represent gender
 */
export enum GenderCode {
  Male = '879',
  Female = '880',
}

/**
 * Assigns a gender from a test slot query result row into a Candidate object if valid
 * @param candidate The candidate object to assign into
 * @param candidateGenderCode The candidate's gender code queried from the DB
 */
const setGenderIfPopulated = (candidate: Candidate, candidateGenderCode: string | null) => {
  if (candidateGenderCode === GenderCode.Male) {
    candidate.gender = 'M';
  }
  if (candidateGenderCode === GenderCode.Female) {
    candidate.gender = 'F';
  }
};
