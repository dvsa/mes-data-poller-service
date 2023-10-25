import * as mysql from 'mysql2';
import * as moment from 'moment';
import { ExaminerTestSlot } from '../../../domain/examiner-test-slot';
import {mapRow, TestSlotRow} from './row-mappers/test-slot-row-mapper';
import { query } from '../../../../../common/framework/mysql/database';
import { info, customDurationMetric } from '@dvsa/mes-microservice-common/application/utils/logger';

/**
 * Get all detailed test slots, for the specified time window.
 * @param connectionPool The MySQL connection pool to use
 * @param examinerIds The examiner ids to use
 * @param journalStartDate The start date of the time window
 * @param endDate The end date of the time window
 * @param testSlotRun Passed as index from loop for logging context
 * @returns The detailed test slots
 */
export const getTestSlots = async (
  connectionPool: mysql.Pool,
  examinerIds: number[],
  journalStartDate: Date,
  endDate: Date,
  testSlotRun?: number,
): Promise<ExaminerTestSlot[]> => {
  const sqlYearFormat = 'YYYY-MM-DD';
  const windowStart = moment(journalStartDate).format(sqlYearFormat);
  const windowEnd = moment(endDate).format(sqlYearFormat);

  info(`Start run ${testSlotRun} - running test slots query from ${windowStart} to ${windowEnd}...`);
  const start = new Date();
  const res = await query(connectionPool, getQuery(examinerIds), [windowStart, windowEnd, windowStart]);
  const results = res.map(mapRow);
  const end = new Date();
  info(`Finished run ${testSlotRun} - ${results.length} test slots loaded and mapped`);
  customDurationMetric('TestSlotsQuery', 'Time taken querying detailed test slots, in seconds', start, end);
  return results;
};

/**
 * Get the SQL query.
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
                 )                                                as cat_ent_check_ind,
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
                                     )                            as candidate_prn,
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
                                              GROUP BY individual_id) AS intd on a.individual_id = intd.individual_id
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
        and (booking_details.candidate_id is null or booking_details.candidate_cd_id = (select max(contact_details_id)
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
