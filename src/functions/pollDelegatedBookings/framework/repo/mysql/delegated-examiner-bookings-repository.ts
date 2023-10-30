import * as mysql from 'mysql2';
import { debug } from '@dvsa/mes-microservice-common/application/utils/logger';
import { config } from '../../config';
import { certificate } from '../../../../../common/certs/ssl_profiles';
import { query } from '../../../../../common/framework/mysql/database';
import { buildDelegatedBookingsFromQueryResult } from './delegated-examiner-bookings-row-mapper';
import { DelegatedBookingDetail } from '../../../../../common/application/models/delegated-booking-details';

export interface DelegatedTestSlotRow {
  app_id: number;
  slot_id: number;
  start_time: Date;
  vehicle_type_code: string | null; // nullable
  vehicle_slot_type_code: number | null; // nullable
  candidate_gender_code: string | null; // nullable
  booking_id: number | null;
  driver_number: string | null;
  individual_id: number;
  first_forename: string | null;
  family_name: string | null;
  test_category_ref: string | null;
  booking_seq: number;
  check_digit: number;
  tc_name: string;
  tc_id: number;
  tc_cost_centre_code: string;
  date_of_birth: Date | null;
  staff_number: string;
}

export const getActiveDelegatedExaminerBookings = async (): Promise<DelegatedBookingDetail[]> => {
  const configuration = config();

  const connection = mysql.createConnection({
    host: configuration.tarsReplicaDatabaseHostname,
    database: configuration.tarsReplicaDatabaseName,
    user: configuration.tarsReplicaDatabaseUsername,
    password: configuration.tarsReplicaDatabasePassword,
    charset: 'UTF8_GENERAL_CI',
    ssl: process.env.TESTING_MODE ? null : certificate,
    authPlugins: {
      mysql_clear_password: () => () => Buffer.from(`${configuration.tarsReplicaDatabasePassword}\0`),
    },
  });

  debug('Connection instantiated');

  const [queryResult] = await query(
    connection,
    `SELECT ps.slot_id
     , ps.start_time
     , bk.app_id
     , bk.booking_id
     , ex.staff_number
     , cd.driver_number
     , cd.individual_id
     , cd.first_forename
     , cd.family_name
     , ts.test_category_ref
     , app_rsis.booking_seq
     , app_rsis.check_digit
     , tcn.tc_name
     , tcn.tc_id
     , tc.tc_cost_centre_code
     , cd.date_of_birth
     , vst.vehicle_type_code
     , vst.vst_code vehicle_slot_type_code
     , cd.gender_code as candidate_gender_code
  FROM tarsreplica.EXAMINER ex
  JOIN tarsreplica.PROGRAMME_SLOT ps
    ON ps.individual_id = ex.individual_id
  JOIN tarsreplica.BOOKING bk
    ON bk.slot_id = ps.slot_id
  JOIN tarsreplica.APPLICATION app
    ON app.app_id = bk.app_id
  JOIN tarsreplica.INDIVIDUAL cd
    ON cd.individual_id = app.individual_id
  JOIN tarsreplica.TEST_SERVICE ts
    ON ts.test_service_id = app.test_service_id
  JOIN tarsreplica.APPLICATION_RSIS_INFO app_rsis
    ON app_rsis.app_id = app.app_id
  JOIN tarsreplica.VEHICLE_SLOT_TYPE vst
    ON vst.VST_CODE = ps.VST_CODE
  JOIN tarsreplica.CUSTOMER_ORDER co
    ON co.order_id = app.order_id
  LEFT JOIN tarsreplica.TEST_CENTRE tc
    ON tc.tc_id = co.delegated_authority_id
  JOIN tarsreplica.TEST_CENTRE_NAME tcn
    ON tcn.tc_id = tc.tc_id
WHERE ex.grade_code = 'DELE'`,
  );

  debug('Query return count', (queryResult as mysql.RowDataPacket[]).length);

  return buildDelegatedBookingsFromQueryResult(queryResult as DelegatedTestSlotRow[]);
};
