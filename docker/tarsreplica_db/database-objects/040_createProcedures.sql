SET GLOBAL log_bin_trust_function_creators = 1;
USE tarsreplica;
DELIMITER //
//

CREATE PROCEDURE uspGenerateExaminerData(IN TestCentreName varchar(50),
                                        IN TestCentreCostCode varchar(6),
                                        IN Country varchar(8),
                                        IN StaffNumber varchar(10),
                                        IN ExaminerFirstName varchar(50),
                                        IN ExaminerLastName varchar(50),
                                        IN Date date)
BEGIN
    SET @TestCentreId		= (SELECT IFNULL((SELECT MAX(tc_id) FROM TEST_CENTRE WHERE tc_id >= 90000000)+1,90000000));
    SET @IndividualId		= (SELECT IFNULL((SELECT MAX(individual_id) FROM INDIVIDUAL WHERE individual_id >= 90000000)+1,90000000));
    SET @CountryId			= (SELECT CASE WHEN Country = 'England' THEN 1 WHEN 'Wales' THEN 2 ELSE 3 END);


    INSERT INTO TEST_CENTRE (tc_id, tc_cost_centre_code, commission_date, decommission_date, country_id)
    SELECT @TestCentreId, TestCentreCostCode, '2009-03-31 00:00:00', null, @CountryId
    FROM DUAL
    WHERE NOT EXISTS
              (
                  SELECT 1
                  FROM TEST_CENTRE
                  WHERE tc_cost_centre_code = TestCentreCostCode
              )
    LIMIT 1;


    INSERT INTO TEST_CENTRE_NAME (tc_id, tc_name)
    SELECT @TestCentreId, TestCentreName
    FROM DUAL
    WHERE NOT EXISTS
              (
                  SELECT 1
                  FROM TEST_CENTRE_NAME
                  WHERE tc_name = TestCentreName
              )
    LIMIT 1;


    INSERT INTO EXAMINER (individual_id, staff_number)
    SELECT @IndividualId, StaffNumber
    FROM DUAL
    WHERE NOT EXISTS
              (
                  SELECT 1
                  FROM EXAMINER e
                           LEFT JOIN EXAMINER_STATUS es ON es.individual_id = e.individual_id
                  WHERE IFNULL(e.grade_code, 'ZZZ') <> 'DELE'
                    AND IFNULL(es.end_date, '4000-01-01') >= Date
                    AND e.staff_number = StaffNumber
              )
    LIMIT 1;


    SET @IndividualId		= (SELECT individual_id FROM EXAMINER WHERE staff_number = StaffNumber);


    INSERT INTO EXAMINER_STATUS (individual_id, start_date)
    SELECT @IndividualId, '2014-01-01'
    FROM DUAL
    WHERE NOT EXISTS
              (
                  SELECT 1
                  FROM EXAMINER_STATUS
                  WHERE individual_id = @IndividualId
              )
    LIMIT 1;


    INSERT INTO INDIVIDUAL (individual_id, driver_number, title_code, family_name, first_forename, second_forename, third_forename)
    SELECT @IndividualId, NULL, NULL, ExaminerLastName, ExaminerFirstName, NULL, NULL
    FROM DUAL
    WHERE NOT EXISTS
              (
                  SELECT 1
                  FROM INDIVIDUAL
                  WHERE individual_id = @IndividualId
              )
    LIMIT 1;

END;
//

CREATE PROCEDURE uspGenerateJournalData(IN Date date, IN IndividualId bigint,
                                        IN TestCentreId bigint, IN CancReason1 varchar(20),
                                        IN CancReason2 varchar(20), IN CancReason3 varchar(20),
                                        IN SlotHr tinyint, IN SlotMinute tinyint,
                                        IN TestCategoryRef varchar(10), IN Minutes smallint,
                                        IN NTACode varchar(4), IN GearboxType varchar(20),
                                        IN LargeVehicle tinyint, IN DriverNumber varchar(24),
                                        IN DateOfBirth datetime, IN Title varchar(20),
                                        IN FirstName varchar(50), IN SecondName varchar(50),
                                        IN ThirdName varchar(50), IN Surname varchar(50),
                                        IN Gender varchar(6), IN EthnicityCode varchar(1),
                                        IN PrimaryTelNo varchar(30),
                                        IN SecondaryTelNo varchar(30),
                                        IN MobileTelNo varchar(30), IN EmailAddress varchar(100),
                                        IN AddressLine1 varchar(255),
                                        IN AddressLine2 varchar(100),
                                        IN AddressLine3 varchar(100),
                                        IN AddressLine4 varchar(100),
                                        IN AddressLine5 varchar(255), IN PostCode varchar(255),
                                        IN ExtendedTest tinyint, IN SpecialNeedsCode varchar(20),
                                        IN EntitlementCheck tinyint, IN WelshTest tinyint,
                                        IN SpecialNeedsText varchar(512),
                                        IN ProgressiveAccess tinyint, IN BookingSeq tinyint,
                                        IN CheckDigit tinyint)
BEGIN


		SET @CandidateId			= (SELECT IFNULL((SELECT MAX(individual_id) FROM INDIVIDUAL WHERE individual_id >= 90000000)+1,90000000));
		SET @ContactDetailsId		= (SELECT IFNULL((SELECT MAX(contact_details_id) FROM CONTACT_DETAILS WHERE contact_details_id >= 90000000)+1,90000000));
		SET @AddressId				= (SELECT IFNULL((SELECT MAX(address_id) FROM ADDRESS WHERE address_id >= 90000000)+1,90000000));
		SET @BookingId				= (SELECT IFNULL((SELECT MAX(booking_id) FROM BOOKING WHERE booking_id >= 90000000)+1,90000000));
		SET @AppId					= (SELECT IFNULL((SELECT MAX(app_id) FROM APPLICATION WHERE app_id >= 90000000)+1,90000000));
		SET @SlotId					= (SELECT IFNULL((SELECT MAX(slot_id) FROM PROGRAMME_SLOT WHERE slot_id >= 90000000)+1,90000000));


		SET @GearboxCode			= (SELECT CASE WHEN GearboxType = 'Manual' THEN 1 ELSE 2 END);
		SET @VehicleId				= (SELECT MAX(vehicle_id) FROM (SELECT vehicle_id, gearbox_code, CASE WHEN height_m IS NULL THEN 0 ELSE 1 END AS large_vehicle FROM VEHICLE LIMIT 1000) v WHERE gearbox_code = @GearboxCode AND large_vehicle = LargeVehicle);
		SET @TestServiceId			= (SELECT MAX(test_service_id) FROM TEST_SERVICE WHERE test_category_ref = TestCategoryRef AND extended_ind = ExtendedTest AND special_needs_code = SpecialNeedsCode);
		SET @VSTCode				= (SELECT VST_CODE FROM TEST_SERVICE WHERE test_service_id = @TestServiceId);
		SET @AppStateCode			= (SELECT CASE WHEN EntitlementCheck = 1 THEN 3 ELSE 2 END);


INSERT INTO PROGRAMME_SLOT (slot_id, start_time, minutes, vst_code, non_test_activity_code, individual_id, programme_date, tc_id, deployed_to_from_code, tc_closed_ind)
SELECT @SlotId, DATE_ADD(DATE_ADD(Date, INTERVAL SlotHr HOUR), INTERVAL SlotMinute MINUTE), Minutes, @VSTCode, NTACode, IndividualId, Date, TestCentreId, 0, 0
FROM DUAL;


INSERT INTO INDIVIDUAL (individual_id, driver_number, date_of_birth, title_code, family_name, first_forename, second_forename, third_forename, gender_code)
SELECT @CandidateId, DriverNumber, DateOfBirth, (SELECT ITEM_ID FROM REF_DATA_ITEM_MASTER WHERE ITEM_DESC1 = Title), Surname, FirstName, SecondName, ThirdName, (SELECT ITEM_ID FROM REF_DATA_ITEM_MASTER WHERE ITEM_DESC1 = Gender)
FROM DUAL
WHERE NTACode IS NULL;


INSERT INTO ETHNIC_ORIGIN (driver_number, ethnicity_code, loaded_date)
SELECT DriverNumber, EthnicityCode, Date
FROM DUAL
WHERE DriverNumber IS NOT NULL;


INSERT INTO CONTACT_DETAILS (contact_details_id, organisation_register_id, individual_id, primary_tel_number, secondary_tel_number, email_address, mobile_tel_number, prim_tel_voicemail_ind, sec_tel_voicemail_ind, mobile_voicemail_ind)
SELECT @ContactDetailsId, NULL, @CandidateId, PrimaryTelNo, SecondaryTelNo, EmailAddress, MobileTelNo, 1, 1, 1
FROM DUAL
WHERE NTACode IS NULL;


INSERT INTO ADDRESS (address_id, address_line_1, address_line_2, address_line_3, address_line_4, address_line_5, post_code, address_type_code, organisation_id, individual_id, created_by)
SELECT @AddressId, AddressLine1, AddressLine2, AddressLine3, AddressLine4, AddressLine5, PostCode, 1263, NULL, @CandidateId, 1
FROM DUAL
WHERE NTACode IS NULL;


INSERT INTO BOOKING (booking_id, app_id, booking_cancel_reason_code, state_code, slot_id, created_on)
SELECT @BookingId, @AppId, (SELECT MIN(booking_cancel_reason_code) FROM BOOKING_CANCELLATION_REASON WHERE initiator_code = 'DSA'), 1, NULL, '2021-03-19 14:59:05'
FROM DUAL
WHERE cancReason1 = 'DSA';

INSERT INTO BOOKING (booking_id, app_id, booking_cancel_reason_code, state_code, slot_id, created_on)
SELECT @BookingId, @AppId, (SELECT MIN(booking_cancel_reason_code) FROM BOOKING_CANCELLATION_REASON WHERE initiator_code = 'Act of nature'), 1, NULL, '2021-03-19 14:59:05'
FROM DUAL
WHERE cancReason1 = 'Act of nature';

UPDATE PROGRAMME_SLOT
SET programme_date = DATE_ADD(programme_date, INTERVAL -1 MONTH)
  ,start_time = DATE_ADD(start_time, INTERVAL -1 MONTH)
WHERE slot_id = @SlotId
  AND cancReason1 IS NOT NULL;

SET @SlotId			= (SELECT IFNULL((SELECT IFNULL((SELECT MAX(slot_id) FROM PROGRAMME_SLOT WHERE slot_id >= 90000000)+1,90000000) FROM DUAL WHERE cancReason1 IS NOT NULL),@SlotId));
SET @BookingId		= (SELECT IFNULL((SELECT IFNULL((SELECT MAX(booking_id) FROM BOOKING WHERE booking_id >= 90000000)+1,90000000) FROM DUAL WHERE cancReason1 IS NOT NULL),@BookingId));

INSERT INTO PROGRAMME_SLOT (slot_id, start_time, minutes, vst_code, non_test_activity_code, individual_id, programme_date, tc_id, deployed_to_from_code, tc_closed_ind)
SELECT @SlotId, DATE_ADD(DATE_ADD(Date, INTERVAL SlotHr HOUR), INTERVAL SlotMinute MINUTE), Minutes, @VSTCode, NTACode, IndividualId, Date, TestCentreId, 0, 0
FROM DUAL
WHERE cancReason1 IS NOT NULL;


INSERT INTO BOOKING (booking_id, app_id, booking_cancel_reason_code, state_code, slot_id, created_on)
SELECT @BookingId, @AppId, (SELECT MIN(booking_cancel_reason_code) FROM BOOKING_CANCELLATION_REASON WHERE initiator_code = 'DSA'), 1, NULL, '2021-03-19 14:59:05'
FROM DUAL
WHERE cancReason2 = 'DSA';

INSERT INTO BOOKING (booking_id, app_id, booking_cancel_reason_code, state_code, slot_id, created_on)
SELECT @BookingId, @AppId, (SELECT MIN(booking_cancel_reason_code) FROM BOOKING_CANCELLATION_REASON WHERE initiator_code = 'Act of nature'), 1, NULL, '2021-03-19 14:59:05'
FROM DUAL
WHERE cancReason2 = 'Act of nature';

UPDATE PROGRAMME_SLOT
SET programme_date = DATE_ADD(programme_date, INTERVAL -2 MONTH)
  ,start_time = DATE_ADD(start_time, INTERVAL -2 MONTH)
WHERE slot_id = @SlotId
  AND cancReason2 IS NOT NULL;

SET @SlotId			= (SELECT IFNULL((SELECT IFNULL((SELECT MAX(slot_id) FROM PROGRAMME_SLOT WHERE slot_id >= 90000000)+1,90000000) FROM DUAL WHERE cancReason2 IS NOT NULL),@SlotId));
SET @BookingId		= (SELECT IFNULL((SELECT IFNULL((SELECT MAX(booking_id) FROM BOOKING WHERE booking_id >= 90000000)+1,90000000) FROM DUAL WHERE cancReason2 IS NOT NULL),@BookingId));

INSERT INTO PROGRAMME_SLOT (slot_id, start_time, minutes, vst_code, non_test_activity_code, individual_id, programme_date, tc_id, deployed_to_from_code, tc_closed_ind)
SELECT @SlotId, DATE_ADD(DATE_ADD(Date, INTERVAL SlotHr HOUR), INTERVAL SlotMinute MINUTE), Minutes, @VSTCode, NTACode, IndividualId, Date, TestCentreId, 0, 0
FROM DUAL
WHERE cancReason2 IS NOT NULL;


INSERT INTO BOOKING (booking_id, app_id, booking_cancel_reason_code, state_code, slot_id, created_on)
SELECT @BookingId, @AppId, (SELECT MIN(booking_cancel_reason_code) FROM BOOKING_CANCELLATION_REASON WHERE initiator_code = 'DSA'), 1, NULL, '2021-03-19 14:59:05'
FROM DUAL
WHERE cancReason3 = 'DSA';

INSERT INTO BOOKING (booking_id, app_id, booking_cancel_reason_code, state_code, slot_id, created_on)
SELECT @BookingId, @AppId, (SELECT MIN(booking_cancel_reason_code) FROM BOOKING_CANCELLATION_REASON WHERE initiator_code = 'Act of nature'), 1, NULL, '2021-03-19 14:59:05'
FROM DUAL
WHERE cancReason3 = 'Act of nature';

UPDATE PROGRAMME_SLOT
SET programme_date = DATE_ADD(programme_date, INTERVAL -3 MONTH)
  ,start_time = DATE_ADD(start_time, INTERVAL -3 MONTH)
WHERE slot_id = @SlotId
  AND cancReason3 IS NOT NULL;

SET @SlotId			= (SELECT IFNULL((SELECT IFNULL((SELECT MAX(slot_id) FROM PROGRAMME_SLOT WHERE slot_id >= 90000000)+1,90000000) FROM DUAL WHERE cancReason3 IS NOT NULL),@SlotId));
SET @BookingId		= (SELECT IFNULL((SELECT IFNULL((SELECT MAX(booking_id) FROM BOOKING WHERE booking_id >= 90000000)+1,90000000) FROM DUAL WHERE cancReason3 IS NOT NULL),@BookingId));

INSERT INTO PROGRAMME_SLOT (slot_id, start_time, minutes, vst_code, non_test_activity_code, individual_id, programme_date, tc_id, deployed_to_from_code, tc_closed_ind)
SELECT @SlotId, DATE_ADD(DATE_ADD(Date, INTERVAL SlotHr HOUR), INTERVAL SlotMinute MINUTE), Minutes, @VSTCode, NTACode, IndividualId, Date, TestCentreId, 0, 0
FROM DUAL
WHERE cancReason3 IS NOT NULL;


INSERT INTO BOOKING (booking_id, app_id, booking_cancel_reason_code, state_code, slot_id, created_on)
SELECT @BookingId, @AppId, NULL, 1, @SlotId, '2021-03-19 14:59:05'
FROM DUAL
WHERE NTACode IS NULL;


INSERT INTO APPLICATION (app_id, ext_req_ind, meeting_place_req_text, state_code, welsh_test_ind, order_id, vehicle_id, individual_id, test_service_id, special_needs_text, progressive_access)
SELECT @AppId, ExtendedTest, NULL, @AppStateCode, WelshTest, 0, @VehicleId, @CandidateId, @TestServiceId, SpecialNeedsText, ProgressiveAccess
FROM DUAL
WHERE NTACode IS NULL;


INSERT INTO APPLICATION_RSIS_INFO (app_id, booking_seq, check_digit, booking_id)
SELECT @AppId, BookingSeq, CheckDigit, @BookingId
FROM DUAL
WHERE NTACode IS NULL;

END;
//

DELIMITER ;
