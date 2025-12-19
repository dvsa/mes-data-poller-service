import * as mysql from 'mysql2';
import * as moment from 'moment';
import {info, customDurationMetric} from '@dvsa/mes-microservice-common/application/utils/logger';
import {ExaminerTestSlot} from '../../../domain/examiner-test-slot';
import {drizzle, MySql2Database} from 'drizzle-orm/mysql2/driver';
import {
  mysqlTable,
  varchar,
  int,
  tinyint,
  decimal,
  text,
  json,
  datetime,
  mysqlEnum,

} from 'drizzle-orm/mysql-core';
import {and, gt, gte, inArray, lt, lte} from 'drizzle-orm';
import {ExaminerRecord} from '../../../domain/examiner-record';

export const ScheduleBookings = mysqlTable(
  'bookings',
  {
    created_date: datetime('created_date').notNull(),
    last_updated_date: datetime('last_updated_date').notNull(),
    booking_reference: varchar('booking_reference', {length: 50}).notNull().primaryKey(),

    examiner_staff_number: varchar('examiner_staff_number', {length: 50}).notNull(),
    examiner_title: varchar('examiner_title', {length: 50}).notNull(),
    examiner_first_name: varchar('examiner_first_name', {length: 100}).notNull(),
    examiner_second_name: varchar('examiner_second_name', {length: 100}).notNull(),
    examiner_third_name: varchar('examiner_third_name', {length: 100}).notNull(),
    examiner_last_name: varchar('examiner_last_name', {length: 100}).notNull(),

    testslot_start: datetime('testslot_start').notNull(),
    testslot_duration_minutes: int('testslot_duration_minutes').notNull(),
    testslot_vehicle_type_code: mysqlEnum('testslot_vehicle_type_code', [
      'L',
      'C',
      'B',
      'T',
      'A2',
      'A3',
      'V4',
      'B1',
      'B2',
      'O',
      'LM',
      'BE',
      'TC',
      'SC']).notNull(),
    testslot_vehicle_slot_type_code: int('testslot_vehicle_slot_type_code').notNull(),

    testcentre_name: varchar('testcentre_name', {length: 255}).notNull(),
    testcentre_cost_code: varchar('testcentre_cost_code', {length: 50}).notNull(),

    candidate_title: varchar('candidate_title', {length: 50}).notNull(),
    candidate_first_name: varchar('candidate_first_name', {length: 100}).notNull(),
    candidate_second_name: varchar('candidate_second_name', {length: 100}).notNull(),
    candidate_third_name: varchar('candidate_third_name', {length: 100}).notNull(),
    candidate_last_name: varchar('candidate_last_name', {length: 100}).notNull(),
    candidate_driver_number: varchar('candidate_driver_number', {length: 50}).notNull(),
    candidate_date_of_birth: datetime('candidate_date_of_birth').notNull(),
    candidate_gender: mysqlEnum('candidate_gender', ['M', 'F']).notNull(),
    candidate_address_line1: varchar('candidate_address_line1', {length: 255}).notNull(),
    candidate_address_line2: varchar('candidate_address_line2', {length: 255}).notNull(),
    candidate_address_line3: varchar('candidate_address_line3', {length: 255}).notNull(),
    candidate_address_line4: varchar('candidate_address_line4', {length: 255}).notNull(),
    candidate_address_line5: varchar('candidate_address_line5', {length: 255}).notNull(),
    candidate_postcode: varchar('candidate_postcode', {length: 20}).notNull(),
    candidate_primary_telephone: varchar('candidate_primary_telephone', {length: 50}).notNull(),
    candidate_secondary_telephone: varchar('candidate_secondary_telephone', {length: 50}).notNull(),
    candidate_mobile_telephone: varchar('candidate_mobile_telephone', {length: 50}).notNull(),
    candidate_email_address: varchar('candidate_email_address', {length: 255}).notNull(),
    candidate_prn: int('candidate_prn'),
    candidate_previous_adi_tests: int('candidate_previous_adi_tests'),
    candidate_ethnicity_code: varchar('candidate_ethnicity_code', {length: 5}),

    application_welsh_test: tinyint('application_welsh_test').notNull(),
    application_extended_test: tinyint('application_extended_test').notNull(),
    application_meeting_place: varchar('application_meeting_place', {length: 255}).notNull(),
    application_progressive_access: tinyint('application_progressive_access').notNull(),
    application_special_needs: text('application_special_needs').notNull(),
    application_special_needs_ext_test: tinyint('application_special_needs_ext_test').notNull(),
    application_special_needs_code: mysqlEnum('application_special_needs_code', ['NONE', 'YES', 'EXTRA']).notNull(),
    application_entitlement_check: tinyint('application_entitlement_check').notNull(),
    application_fit_marker: tinyint('application_fit_marker').notNull(),
    application_fit_case_number: varchar('application_fit_case_number', {length: 50}).notNull(),
    application_category_entitlement_check: tinyint('application_category_entitlement_check').notNull(),
    application_vehicle_seats: int('application_vehicle_seats'),
    application_vehicle_height_m: decimal('application_vehicle_height_m', {precision: 5, scale: 2}),
    application_vehicle_width_m: decimal('application_vehicle_width_m', {precision: 5, scale: 2}),
    application_vehicle_length_m: decimal('application_vehicle_length_m', {precision: 5, scale: 2}),
    application_test_category: varchar('application_test_category', {length: 10}).notNull(),
    application_vehicle_gearbox: mysqlEnum('application_vehicle_gearbox',
                                           [
                                             'Manual',
                                             'Semi-Automatic',
                                             'Automatic',
                                           ]).notNull(),

    previous_cancellation: json('previous_cancellation').$type<string[]>(),
    business_id: int('business_id'),
    business_name: varchar('business_name', {length: 255}),
    business_address_line1: varchar('business_address_line1', {length: 255}),
    business_address_line2: varchar('business_address_line2', {length: 255}),
    business_address_line3: varchar('business_address_line3', {length: 255}),
    business_address_line4: varchar('business_address_line4', {length: 255}),
    business_address_line5: varchar('business_address_line5', {length: 255}),
    business_postcode: varchar('business_postcode', {length: 20}),
    business_telephone: varchar('business_telephone', {length: 50}),

    examiner_visiting: tinyint('examiner_visiting'),
  },
);

/**
 * Get all detailed test slots, for the specified time window.
 * @param connectionPool
 * @param examinerRecords
 * @param journalStartDate The start date of the time window
 * @param endDate The end date of the time window
 * @param testSlotRun Passed as index from loop for logging context
 * @returns The detailed test slots
 */

export const getDSPTestSlots = async (
  connectionPool: mysql.Pool,
  examinerRecords: ExaminerRecord[],
  journalStartDate: Date,
  endDate: Date,
  testSlotRun?: number,
): Promise<ExaminerTestSlot[]> => {
  const db: MySql2Database = drizzle(connectionPool);

  const windowStart = moment(journalStartDate).toDate();
  const windowEnd = moment(endDate).toDate();

  info(`Start run ${testSlotRun} - running test DES slots query from ${windowStart} to ${windowEnd}...`);
  const start = new Date();

  const newQuery = db
    .select({
      examinerStaffNumber: ScheduleBookings.examiner_staff_number,
      bookingReference: ScheduleBookings.booking_reference,
      applicationEntitlementCheck: ScheduleBookings.application_entitlement_check,
      applicationExtendedTest: ScheduleBookings.application_extended_test,
      applicationFitMarker: ScheduleBookings.application_fit_marker,
      applicationProgressiveAccess: ScheduleBookings.application_progressive_access,
      applicationSpecialNeedsCode: ScheduleBookings.application_special_needs_code,
      applicationSpecialNeedsExtTest: ScheduleBookings.application_special_needs_ext_test,
      applicationTestCategory: ScheduleBookings.application_test_category,
      applicationVehicleGearbox: ScheduleBookings.application_vehicle_gearbox,
      applicationWelshTest: ScheduleBookings.application_welsh_test,
      applicationMeetingPlace: ScheduleBookings.application_meeting_place,
      applicationCategoryEntitlementCheck: ScheduleBookings.application_category_entitlement_check,

      candidateAddressLine1: ScheduleBookings.candidate_address_line1,
      candidateAddressLine2: ScheduleBookings.candidate_address_line2,
      candidateAddressLine3: ScheduleBookings.candidate_address_line3,
      candidateAddressLine4: ScheduleBookings.candidate_address_line4,
      candidateAddressLine5: ScheduleBookings.candidate_address_line5,
      candidatePostcode: ScheduleBookings.candidate_postcode,
      candidateFirstName: ScheduleBookings.candidate_first_name,
      candidateLastName: ScheduleBookings.candidate_last_name,
      candidateTitle: ScheduleBookings.candidate_title,
      candidateDriverNumber: ScheduleBookings.candidate_driver_number,
      candidateMobileTelephone: ScheduleBookings.candidate_mobile_telephone,
      candidatePrimaryTelephone: ScheduleBookings.candidate_primary_telephone,
      candidateSecondaryTelephone: ScheduleBookings.candidate_secondary_telephone,
      candidateDateOfBirth: ScheduleBookings.candidate_date_of_birth,
      candidateEthnicityCode: ScheduleBookings.candidate_ethnicity_code,
      candidateGender: ScheduleBookings.candidate_gender,

      previousCancellation: ScheduleBookings.previous_cancellation,

      testslotDurationMinutes: ScheduleBookings.testslot_duration_minutes,
      testslotStart: ScheduleBookings.testslot_start,
      testcentreName: ScheduleBookings.testcentre_name,
      testcentreCostCode: ScheduleBookings.testcentre_cost_code,
      testslotVehicleTypeCode: ScheduleBookings.testslot_vehicle_type_code,
      testslotVehicleSlotTypeCode: ScheduleBookings.testslot_vehicle_slot_type_code,
      examinerVisiting: ScheduleBookings.examiner_visiting,
    })
    .from(ScheduleBookings)
    .where(
      and(
        inArray(ScheduleBookings.examiner_staff_number, examinerRecords.map((id) => id.staff_number.toString())),
        gte(ScheduleBookings.testslot_start, windowStart),
        lte(ScheduleBookings.testslot_start, windowEnd),
      ));

  info('query complete.', newQuery.toSQL());

  const rows = await newQuery;

  info('DES Slots query returned rows:', rows.length);
  const results: ExaminerTestSlot[] = rows.map((r: any): ExaminerTestSlot => {
    info(
      'Mapping DES test slot for booking reference:', r.bookingReference,
      'previous cancellations:', r.previousCancellation);
    return {
      examinerId: examinerRecords.find(
        (record: ExaminerRecord) => record.staff_number === r.examinerStaffNumber
      ).individual_id,
      testSlot: {
        booking: {
          application: {
            bookingId: r.bookingReference,
            entitlementCheck: Boolean(r.applicationEntitlementCheck),
            extendedTest: Boolean(r.applicationExtendedTest),
            fitMarker: Boolean(r.applicationFitMarker),
            progressiveAccess: Boolean(r.applicationProgressiveAccess),
            specialNeedsCode: r.applicationSpecialNeedsCode,
            specialNeedsExtendedTest: Boolean(r.applicationSpecialNeedsExtTest),
            testCategory: r.applicationTestCategory,
            vehicleGearbox: r.applicationVehicleGearbox,
            welshTest: Boolean(r.applicationWelshTest),
            meetingPlace: r.applicationMeetingPlace,
            categoryEntitlementCheck: Boolean(r.applicationCategoryEntitlementCheck),
          },
          candidate: {
            candidateAddress: {
              addressLine1: r.candidateAddressLine1,
              addressLine2: r.candidateAddressLine2,
              addressLine3: r.candidateAddressLine3,
              addressLine4: r.candidateAddressLine4,
              addressLine5: r.candidateAddressLine5,
              postcode: r.candidatePostcode,
            },
            candidateId: r.candidateId != null ? Number(r.candidateId) : undefined,
            candidateName: {
              firstName: r.candidateFirstName,
              lastName: r.candidateLastName,
              title: r.candidateTitle,
            },
            driverNumber: r.candidateDriverNumber,
            mobileTelephone: r.candidateMobileTelephone,
            primaryTelephone: r.candidatePrimaryTelephone,
            secondaryTelephone: r.candidateSecondaryTelephone,
            dateOfBirth: r.candidateDateOfBirth ? moment(r.candidateDateOfBirth).format('YYYY-MM-DD') : undefined,
            ethnicityCode: r.candidateEthnicityCode,
            gender: r.candidateGender,
          },
          previousCancellation: JSON.parse(r.previousCancellation),
        },
        slotDetail: {
          duration: r.testslotDurationMinutes != null ? Number(r.testslotDurationMinutes) : undefined,
          slotId: r.slotId != null ? Number(r.slotId) : undefined,
          start: r.testslotStart ? moment(r.testslotStart).format('YYYY-MM-DDTHH:mm:ss') : undefined,
        },
        testCentre: {
          centreName: r.testcentreName,
          costCode: r.testcentreCostCode,
        },
        vehicleTypeCode: r.testslotVehicleTypeCode,
        vehicleSlotTypeCode: r.testslotVehicleSlotTypeCode != null ? Number(r.testslotVehicleSlotTypeCode) : undefined,
        examinerVisiting: Boolean(r.examinerVisiting),
      },
    };
  });

  info('Mapping complete. ', results);

  const end = new Date();
  info(`Finished DES Slots run ${testSlotRun} - ${results.length} test slots loaded and mapped`);
  customDurationMetric(
    'DESTestSlotsQuery',
    'Time taken querying detailed test slots, in seconds',
    start,
    end);
  return results;
};
