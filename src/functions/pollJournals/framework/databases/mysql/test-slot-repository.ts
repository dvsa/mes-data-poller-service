import * as mysql from 'mysql2';
import * as moment from 'moment';
import {mapRow} from './row-mappers/test-slot-row-mapper';
import {poolQuery} from '../../../../../common/framework/mysql/database';
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

export const bookings = mysqlTable(
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

export const getDESTestSlots = async (
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
      examinerStaffNumber: bookings.examiner_staff_number,
      bookingReference: bookings.booking_reference,
      applicationEntitlementCheck: bookings.application_entitlement_check,
      applicationExtendedTest: bookings.application_extended_test,
      applicationFitMarker: bookings.application_fit_marker,
      applicationProgressiveAccess: bookings.application_progressive_access,
      applicationSpecialNeedsCode: bookings.application_special_needs_code,
      applicationSpecialNeedsExtTest: bookings.application_special_needs_ext_test,
      applicationTestCategory: bookings.application_test_category,
      applicationVehicleGearbox: bookings.application_vehicle_gearbox,
      applicationWelshTest: bookings.application_welsh_test,
      applicationMeetingPlace: bookings.application_meeting_place,
      applicationCategoryEntitlementCheck: bookings.application_category_entitlement_check,

      candidateAddressLine1: bookings.candidate_address_line1,
      candidateAddressLine2: bookings.candidate_address_line2,
      candidateAddressLine3: bookings.candidate_address_line3,
      candidateAddressLine4: bookings.candidate_address_line4,
      candidateAddressLine5: bookings.candidate_address_line5,
      candidatePostcode: bookings.candidate_postcode,
      candidateFirstName: bookings.candidate_first_name,
      candidateLastName: bookings.candidate_last_name,
      candidateTitle: bookings.candidate_title,
      candidateDriverNumber: bookings.candidate_driver_number,
      candidateMobileTelephone: bookings.candidate_mobile_telephone,
      candidatePrimaryTelephone: bookings.candidate_primary_telephone,
      candidateSecondaryTelephone: bookings.candidate_secondary_telephone,
      candidateDateOfBirth: bookings.candidate_date_of_birth,
      candidateEthnicityCode: bookings.candidate_ethnicity_code,
      candidateGender: bookings.candidate_gender,

      previousCancellation: bookings.previous_cancellation,

      testslotDurationMinutes: bookings.testslot_duration_minutes,
      testslotStart: bookings.testslot_start,
      testcentreName: bookings.testcentre_name,
      testcentreCostCode: bookings.testcentre_cost_code,
      testslotVehicleTypeCode: bookings.testslot_vehicle_type_code,
      testslotVehicleSlotTypeCode: bookings.testslot_vehicle_slot_type_code,
      examinerVisiting: bookings.examiner_visiting,
    })
    .from(bookings)
    .where(
      and(
        inArray(bookings.examiner_staff_number, examinerRecords.map((id) => id.staff_number.toString())),
        gte(bookings.testslot_start, windowStart),
        lte(bookings.testslot_start, windowEnd),
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

export const getTestSlots = async (
  connectionPool: mysql.Pool,
  examinerIds: number[],
  journalStartDate: Date,
  endDate: Date,
  testSlotRun?: number,
): Promise<ExaminerTestSlot[]> => {
  if (process.env.IS_DEV) {
    return [
      {
        examinerId: 1,
        testSlot: {
          booking: {
            application: {
              applicationId: Number(`1${testSlotRun}`),
              bookingSequence: 1,
              checkDigit: 1,
              entitlementCheck: false,
              extendedTest: false,
              fitMarker: true,
              progressiveAccess: false,
              specialNeedsCode: 'NONE',
              specialNeedsExtendedTest: false,
              testCategory: 'B',
              vehicleGearbox: 'Automatic',
              welshTest: false,
              meetingPlace: 'Test Meeting Place.',
              categoryEntitlementCheck: false,
            },
            candidate: {
              candidateAddress: {
                addressLine1: 'Address Line 1',
                addressLine2: 'Address Line 2',
                addressLine3: 'Address Line 3',
                addressLine4: 'Address Line 4',
                addressLine5: 'Address Line 5',
                postcode: 'PO57 0DE',
              },
              candidateId: 9000,
              candidateName: {
                firstName: 'Firstname',
                lastName: 'Surname',
                title: 'Title',
              },
              driverNumber: 'SURNA123456789DO',
              mobileTelephone: '07111 123456',
              primaryTelephone: '01234 567890',
              secondaryTelephone: '04321 098765',
              dateOfBirth: '1977-07-02',
              ethnicityCode: 'D',
              gender: 'F',
            },
            previousCancellation: [
              'Act of nature',
            ],
          },
          slotDetail: {
            duration: 57,
            slotId: 1000,
            start: moment(Date.now()).format('YYYY-MM-DDTHH:mm:ss'),
          },
          testCentre: {
            centreId: 1,
            centreName: 'Test Centre 1',
            costCode: 'TC1',
          },
          vehicleTypeCode: 'C',
          vehicleSlotTypeCode: 7,
          examinerVisiting: false,
        },
      },
    ];
  }
  const sqlYearFormat = 'YYYY-MM-DD';
  const windowStart = moment(journalStartDate).format(sqlYearFormat);
  const windowEnd = moment(endDate).format(sqlYearFormat);

  info(`Start run ${testSlotRun} - running test slots query from ${windowStart} to ${windowEnd}...`);
  const start = new Date();
  const res = await poolQuery(
    connectionPool,
    mysql.format(
      getQuery(examinerIds),
      [windowStart, windowEnd, windowStart]),
  );
  const results = res.map(mapRow);
  const end = new Date();
  info(`Finished run ${testSlotRun} - ${results.length} test slots loaded and mapped`);
  customDurationMetric('TestSlotsQuery', 'Time taken querying detailed test slots, in seconds', start, end);
  return results;
};

/**
 * Get the SQL query (TARS).
 * @param ids The examiner ids
 * @returns The SQL query
 */
/* eslint-disable max-len */
const getQuery = (ids: number[]) => {
  return `
        select w.slot_id,
               w.start_time                                         as start_time,
               w.minutes                                            as minutes,
               vst.vehicle_type_code                                as vehicle_type_code,
               w.tc_id,
               tc.tc_cost_centre_code                               as tc_cost_centre_code,
               tcn.tc_name                                          as tc_name,
               w.individual_id,
               w.programme_date,
               booking_details.booking_id,
               booking_details.app_id,
               booking_details.booking_seq,
               booking_details.check_digit,
               booking_details.welsh_test_ind,
               booking_details.ext_req_ind,
               booking_details.progressive_access,
               booking_details.meeting_place                        as meeting_place,
               booking_details.special_needs                        as special_needs,
               booking_details.special_needs_extended_test          as special_needs_extended_test,
               booking_details.special_needs_code                   as special_needs_code,
               booking_details.vehicle_slot_type_code               as vehicle_slot_type_code,
               getEntitlementCheckIndicator(booking_details.app_id) as ent_check_ind,
               booking_details.cab_seat_count,
               booking_details.passenger_seat_count,
               booking_details.height_metres,
               booking_details.length_metres,
               booking_details.width_metres,
               booking_details.vehicle_category                     as vehicle_category,
               booking_details.gearbox_code                         as gearbox_type,
               booking_details.candidate_id,
               booking_details.candidate_title                      as candidate_title,
               booking_details.candidate_first_name                 as candidate_first_name,
               booking_details.candidate_second_name                as candidate_second_name,
               booking_details.candidate_third_name                 as candidate_third_name,
               booking_details.candidate_surname                    as candidate_surname,
               booking_details.candidate_driver_number              as candidate_driver_number,
               booking_details.candidate_date_of_birth              as candidate_date_of_birth,
               booking_details.candidate_gender_code                as candidate_gender_code,
               booking_details.candidate_ethnicity_code             as candidate_ethnicity_code,
               booking_details.prim_tel_voicemail_ind               as cand_primary_tel_ind,
               booking_details.primary_tel_number                   as cand_primary_tel,
               booking_details.sec_tel_voicemail_ind                as cand_secondary_tel_ind,
               booking_details.secondary_tel_number                 as cand_secondary_tel,
               booking_details.mobile_voicemail_ind                 as cand_mobile_tel_ind,
               booking_details.mobile_tel_number                    as cand_mobile_tel,
               booking_details.cand_email                           as cand_email,
               booking_details.address_line_1                       as candidate_addr_line1,
               booking_details.address_line_2                       as candidate_addr_line2,
               booking_details.address_line_3                       as candidate_addr_line3,
               booking_details.address_line_4                       as candidate_addr_line4,
               booking_details.address_line_5                       as candidate_addr_line5,
               booking_details.post_code                            as candidate_post_code,
               booking_details.candidate_prn,
               (
                   IF(
                           booking_details.candidate_prn is not null,
                           getPreviousADIAttempts(
                                   booking_details.candidate_id,
                                   booking_details.vehicle_category,
                                   booking_details.app_id
                           ),
                           null
                   )
                   )                                                as prev_attempts,
               booking_details.business_id,
               booking_details.business_name                        as business_name,
               booking_details.business_addr_line1                  as business_addr_line1,
               booking_details.business_addr_line2                  as business_addr_line2,
               booking_details.business_addr_line3                  as business_addr_line3,
               booking_details.business_addr_line4                  as business_addr_line4,
               booking_details.business_addr_line5                  as business_addr_line5,
               booking_details.business_post_code                   as business_post_code,
               booking_details.business_telephone                   as business_telephone,
               booking_details.cancel_initiator,
               getBusLorryDVLAConfIndicator(
                       booking_details.candidate_id,
                       booking_details.vehicle_category
               )                                                    as cat_ent_check_ind,
               booking_details.integrity_ind,
               booking_details.integrity_case_number
        from WORK_SCHEDULE_SLOTS w
                 join TEST_CENTRE tc on w.tc_id = tc.tc_id
                 join TEST_CENTRE_NAME tcn on w.tc_id = tcn.tc_id
                 left join VEHICLE_SLOT_TYPE vst on w.vst_code = vst.vst_code
                 left join (select b.booking_id                     as booking_id,
                                   b.app_id                         as app_id,
                                   b.slot_id                        as slot_id,
                                   a.welsh_test_ind                 as welsh_test_ind,
                                   a.ext_req_ind                    as ext_req_ind,
                                   a.progressive_access,
                                   a.meeting_place_req_text         as meeting_place,
                                   a.special_needs_text             as special_needs,
                                   ts.extended_ind                  as special_needs_extended_test,
                                   ts.special_needs_code            as special_needs_code,
                                   ari.booking_seq                  as booking_seq,
                                   ari.check_digit                  as check_digit,
                                   v.cab_seat_count,
                                   v.passenger_seat_count,
                                   v.height_m                       as height_metres,
                                   v.length_m                       as length_metres,
                                   v.width_m                        as width_metres,
                                   v.gearbox_code,
                                   ts.test_category_ref             as vehicle_category,
                                   i.individual_id                  as candidate_id,
                                   title_ref.item_desc1             as candidate_title,
                                   i.first_forename                 as candidate_first_name,
                                   i.second_forename                as candidate_second_name,
                                   i.third_forename                 as candidate_third_name,
                                   i.family_name                    as candidate_surname,
                                   i.driver_number                  as candidate_driver_number,
                                   i.date_of_birth                  as candidate_date_of_birth,
                                   i.gender_code                    as candidate_gender_code,
                                   eo.ethnicity_code                as candidate_ethnicity_code,
                                   ccd.contact_details_id           as candidate_cd_id,
                                   ccd.prim_tel_voicemail_ind,
                                   ccd.primary_tel_number,
                                   intd.integrity_ind               as integrity_ind,
                                   intd.integrity_case_number       as integrity_case_number,
                                   ccd.sec_tel_voicemail_ind,
                                   ccd.secondary_tel_number,
                                   ccd.mobile_voicemail_ind,
                                   ccd.mobile_tel_number,
                                   ccd.email_address                as cand_email,
                                   cand_addr.address_id             as candidate_addr_id,
                                   cand_addr.address_line_1,
                                   cand_addr.address_line_2,
                                   cand_addr.address_line_3,
                                   cand_addr.address_line_4,
                                   cand_addr.address_line_5,
                                   cand_addr.post_code,
                                   ts.vst_code                      as vehicle_slot_type_code,
                                   IF(
                                           ts.test_category_ref like 'ADI%' or ts.test_category_ref = 'SC',
                                           cand_adi.prn,
                                           null
                                   )                                as candidate_prn,
                                   org_reg.business_id              as business_id,
                                   org.organisation_name            as business_name,
                                   org.organisation_id              as organisation_id,
                                   org_reg.organisation_register_id as organisation_register_id,
                                   bus_addr.address_id              as business_addr_id,
                                   bus_cd.contact_details_id        as business_cd_id,
                                   bus_addr.address_line_1          as business_addr_line1,
                                   bus_addr.address_line_2          as business_addr_line2,
                                   bus_addr.address_line_3          as business_addr_line3,
                                   bus_addr.address_line_4          as business_addr_line4,
                                   bus_addr.address_line_5          as business_addr_line5,
                                   bus_addr.post_code               as business_post_code,
                                   bus_cd.primary_tel_number        as business_telephone,
                                   cancellations.cancel_initiator
                            from BOOKING b
                                     join APPLICATION a on a.app_id = b.app_id
                                     join APPLICATION_RSIS_INFO ari on b.booking_id = ari.booking_id
                                     left join CONTACT_DETAILS ccd on a.individual_id = ccd.individual_id
                                     left join (SELECT individual_id,
                                                       integrity_case_number,
                                                       integrity_ind,
                                                       MAX(entry_date_time) AS max_entry_date_time
                                                FROM INTEGRITY_DETAILS
                                                GROUP BY individual_id) AS intd
                                               on a.individual_id = intd.individual_id
                                     left join VEHICLE v on a.vehicle_id = v.vehicle_id
                                     left join TEST_SERVICE ts on a.test_service_id = ts.test_service_id
                                     left join INDIVIDUAL i on a.individual_id = i.individual_id
                                     left join REF_DATA_ITEM_MASTER title_ref on i.title_code = title_ref.item_id
                                     left join ADDRESS cand_addr on cand_addr.address_type_code = 1263 and
                                                                    a.individual_id = cand_addr.individual_id
                                     left join REGISTER cand_adi on a.individual_id = cand_adi.individual_id
                                     left join CUSTOMER_ORDER co
                                               on a.order_id = co.order_id and co.booker_type_code in ('B', 'T')
                                     left join ORGANISATION_REGISTER org_reg on co.business_id = org_reg.business_id
                                     left join ORGANISATION org on org_reg.organisation_id = org.organisation_id
                                     left join ADDRESS bus_addr on
                                bus_addr.address_type_code = 1280 and
                                org.organisation_id = bus_addr.organisation_id
                                     left join CONTACT_DETAILS bus_cd
                                               on bus_cd.organisation_register_id = org_reg.organisation_register_id
                                     left join (select driver_number, ethnicity_code
                                                from ETHNIC_ORIGIN
                                                         join (select driver_number as dn2, max(loaded_date) as date2
                                                               from ETHNIC_ORIGIN
                                                               group by driver_number) eo2
                                                              on driver_number = dn2 and loaded_date = date2) eo
                                               on i.driver_number = eo.driver_number
                                     left join (select cancelled_bookings.app_id,
                                                       group_concat(bcr.initiator_code) as cancel_initiator
                                                from BOOKING cancelled_bookings
                                                         join BOOKING_CANCELLATION_REASON bcr
                                                              on cancelled_bookings.booking_cancel_reason_code =
                                                                 bcr.booking_cancel_reason_code
                                                where bcr.initiator_code in ('Act of nature', 'DSA')
                                                group by cancelled_bookings.app_id) cancellations
                                               on cancellations.app_id = a.app_id
                            where b.state_code !=2) booking_details on w.slot_id = booking_details.slot_id
        where w.individual_id in (${ids.join(',')})
          and w.programme_date between ? and ?
          and w.examiner_end_date >= ?
          and (w.non_test_activity_code is null or booking_details.slot_id is not null)
          and (booking_details.candidate_id is null or
               booking_details.candidate_cd_id = (select max(contact_details_id)
                                                  from CONTACT_DETAILS
                                                  where individual_id = booking_details.candidate_id))
          and (booking_details.candidate_id is null or booking_details.candidate_addr_id = (select max(address_id)
                                                                                            from ADDRESS
                                                                                            where individual_id = booking_details.candidate_id
                                                                                              and address_type_code = 1263))
          and (booking_details.organisation_register_id is null or
               booking_details.business_cd_id = (select max(contact_details_id)
                                                 from CONTACT_DETAILS
                                                 where organisation_register_id = booking_details.organisation_register_id))
          and (booking_details.organisation_id is null or booking_details.business_addr_id = (select max(address_id)
                                                                                              from ADDRESS
                                                                                              where organisation_id = booking_details.organisation_id
                                                                                                and address_type_code = 1280))
    `;
};
