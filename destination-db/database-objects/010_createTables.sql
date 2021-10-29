CREATE DATABASE IF NOT EXISTS tarsreplica;

USE tarsreplica;

CREATE TABLE IF NOT EXISTS EXAMINER
(   
	STAFF_NUMBER VARCHAR(10) NOT NULL,
	GRADE_CODE VARCHAR(4),
	INDIVIDUAL_ID BIGINT NOT NULL,
	CONSTRAINT PK_EXAMINER PRIMARY KEY (INDIVIDUAL_ID),
	CONSTRAINT UQ_EXAMINER_STAFF_NUMBER UNIQUE (STAFF_NUMBER)
);

CREATE TABLE IF NOT EXISTS EXAMINER_GRADE
(
  EXAMINER_GRADE_CODE VARCHAR(4),
  TEST_CENTRE_MANAGER_IND TINYINT,
  CONSTRAINT PK_EXAMINER_GRADE PRIMARY KEY (EXAMINER_GRADE_CODE)
);

CREATE TABLE IF NOT EXISTS INDIVIDUAL
(   
	INDIVIDUAL_ID BIGINT,
	DRIVER_NUMBER VARCHAR(24),
	DATE_OF_BIRTH DATETIME,
	TITLE_CODE BIGINT,
	FAMILY_NAME VARCHAR(50),
	FIRST_FORENAME VARCHAR(50),
	SECOND_FORENAME VARCHAR(50),
	THIRD_FORENAME VARCHAR(50),
	GENDER_CODE BIGINT,
	CONSTRAINT PK_INDIVIDUAL PRIMARY KEY (INDIVIDUAL_ID)
);

CREATE TABLE IF NOT EXISTS ETHNIC_ORIGIN
(
	DRIVER_NUMBER VARCHAR(24),
	ETHNICITY_CODE VARCHAR(1),
	LOADED_DATE DATETIME
);

CREATE TABLE IF NOT EXISTS REF_DATA_ITEM_MASTER
(
	ITEM_ID BIGINT,
	ITEM_DESC1 VARCHAR(255),
	ITEM_DESC2 VARCHAR(255),
	CATEGORY_ID BIGINT,
	CONSTRAINT PK_REF_DATA_ITEM_MASTER PRIMARY KEY (CATEGORY_ID, ITEM_ID)
);

CREATE TABLE IF NOT EXISTS TEST_CENTRE
(  
	TC_ID BIGINT NOT NULL,
	TC_COST_CENTRE_CODE VARCHAR(6) NOT NULL,
	COUNTRY_ID BIGINT NOT NULL,
	CONSTRAINT PK_TEST_CENTRE PRIMARY KEY (TC_ID),
	CONSTRAINT UQ_TEST_CENTRE_COST_CENTRE_CODE UNIQUE (TC_COST_CENTRE_CODE)
);

CREATE TABLE IF NOT EXISTS TEST_CENTRE_NAME
(
	TC_ID BIGINT NOT NULL,
	TC_NAME VARCHAR(50) NOT NULL,
	CONSTRAINT PK_TEST_CENTRE_NAME PRIMARY KEY (TC_ID),
	CONSTRAINT UQ_TEST_CENTRE_NAME_TC_NAME UNIQUE (TC_NAME)
);

CREATE TABLE IF NOT EXISTS EXAMINER_STATUS
(
	INDIVIDUAL_ID BIGINT,
	START_DATE DATETIME NOT NULL,
	END_DATE DATETIME,
	CONSTRAINT PK_EXAMINER_STATUS PRIMARY KEY (INDIVIDUAL_ID, START_DATE)
);

CREATE TABLE IF NOT EXISTS AREA
(
	AREA_ID DECIMAL(12,0) NOT NULL,
	DAYS_IN_ADVANCE_COUNT INT(11) NOT NULL,
	COUNTRY_ID INT(11) DEFAULT NULL,
	CONSTRAINT PK_AREA PRIMARY KEY (AREA_ID)
);

CREATE TABLE IF NOT EXISTS NON_WORKING_DAY
(
	COUNTRY_ID INT(11) NOT NULL,
	NON_WORKING_DATE DATETIME NOT NULL,
	STATUTORY_IND TINYINT(4) NOT NULL,
	CONSTRAINT PK_NON_WORKING_DAY PRIMARY KEY (COUNTRY_ID, NON_WORKING_DATE)
);

CREATE TABLE IF NOT EXISTS PROGRAMME
(
	INDIVIDUAL_ID BIGINT NOT NULL,
	PROGRAMME_DATE DATETIME NOT NULL,
	TC_ID BIGINT NOT NULL,
	STATE_CODE INT NOT NULL,
	CONSTRAINT PK_PROGRAMME PRIMARY KEY (INDIVIDUAL_ID, PROGRAMME_DATE, TC_ID)
);

CREATE TABLE IF NOT EXISTS PROGRAMME_SLOT
(
	SLOT_ID BIGINT NOT NULL,
	START_TIME DATETIME NOT NULL,
	MINUTES SMALLINT NOT NULL,
	VST_CODE BIGINT,
	NON_TEST_ACTIVITY_CODE VARCHAR(4),
	INDIVIDUAL_ID BIGINT NOT NULL,
	PROGRAMME_DATE DATETIME NOT NULL,
	TC_ID BIGINT NOT NULL,
	DEPLOYED_TO_FROM_CODE TINYINT,
	TC_CLOSED_IND TINYINT NOT NULL,
	STATE_CODE INT,
	NOT_BOOKABLE_IND TINYINT,
	CONSTRAINT PK_PROGRAMME_SLOT PRIMARY KEY (SLOT_ID)
);

CREATE TABLE IF NOT EXISTS BOOKING
(
	BOOKING_ID BIGINT NOT NULL,
	APP_ID BIGINT NOT NULL,
	BOOKING_CANCEL_REASON_CODE INT,
	STATE_CODE INT NOT NULL,
	SLOT_ID BIGINT,
	CONSTRAINT PK_BOOKING PRIMARY KEY (BOOKING_ID),
	CONSTRAINT UQ_BOOKING_SLOT_ID UNIQUE (SLOT_ID)
);

CREATE TABLE IF NOT EXISTS PERSONAL_COMMITMENT
(
	COMMITMENT_ID BIGINT NOT NULL,
	END_DATE_TIME DATETIME NOT NULL, 
	INDIVIDUAL_ID BIGINT NOT NULL, 
	NON_TEST_ACTIVITY_CODE VARCHAR(4) NOT NULL, 
	START_DATE_TIME DATETIME NOT NULL,
	CONSTRAINT PK_PERSONAL_COMMITMENT PRIMARY KEY (COMMITMENT_ID)
);

CREATE TABLE IF NOT EXISTS NON_TEST_ACTIVITY_REASON
(
	NON_TEST_ACTIVITY_CODE VARCHAR(4) NOT NULL,
	REASON_DESC VARCHAR(50) NOT NULL,
	CONSTRAINT PK_NON_TEST_ACTIVITY_REASON PRIMARY KEY (NON_TEST_ACTIVITY_CODE)
);

CREATE TABLE IF NOT EXISTS VEHICLE_SLOT_TYPE
(
	VST_CODE BIGINT NOT NULL,
	VEHICLE_TYPE_CODE VARCHAR(2), 
	CONSTRAINT PK_VEHICLE_SLOT_TYPE PRIMARY KEY (VST_CODE)
);

CREATE TABLE IF NOT EXISTS DEPLOYMENT
(
	DEPLOYMENT_ID BIGINT NOT NULL, 
	START_DATE DATETIME NOT NULL, 
	END_DATE DATETIME NOT NULL, 
	TC_ID BIGINT NOT NULL, 
	INDIVIDUAL_ID BIGINT,
	CONSTRAINT PK_DEPLOYMENT PRIMARY KEY (DEPLOYMENT_ID)
);

CREATE TABLE IF NOT EXISTS APPLICATION
(
	APP_ID BIGINT NOT NULL,
	EXT_REQ_IND TINYINT NOT NULL,
	MEETING_PLACE_REQ_TEXT VARCHAR(512) NULL,
	STATE_CODE INT NOT NULL,
	WELSH_TEST_IND TINYINT NOT NULL,
	ORDER_ID BIGINT NOT NULL,
	VEHICLE_ID BIGINT NULL,
	INDIVIDUAL_ID BIGINT NULL,
	TEST_SERVICE_ID BIGINT NULL,
	SPECIAL_NEEDS_TEXT VARCHAR(512) NULL,
	PROGRESSIVE_ACCESS TINYINT NOT NULL,
	CONSTRAINT PK_APPLICATION PRIMARY KEY (APP_ID)
);

CREATE TABLE IF NOT EXISTS APPLICATION_HISTORY
(
	APP_ID BIGINT NOT NULL,
	EVENT_CODE BIGINT NOT NULL,
	EVENT_DATE_TIME DATETIME NOT NULL,
	CONSTRAINT PK_APPLICATION_HISTORY PRIMARY KEY (APP_ID, EVENT_DATE_TIME)
);

CREATE TABLE IF NOT EXISTS APPLICATION_RSIS_INFO
(
	APP_ID BIGINT NOT NULL,
	BOOKING_SEQ TINYINT NOT NULL,
	CHECK_DIGIT TINYINT NOT NULL,
	BOOKING_ID BIGINT NOT NULL,
	CONSTRAINT PK_APPLICATION_RSIS_INFO PRIMARY KEY (APP_ID, BOOKING_SEQ)
);

CREATE TABLE IF NOT EXISTS VEHICLE 
(
	VEHICLE_ID BIGINT NOT NULL,
	CAB_SEAT_COUNT SMALLINT NULL,
	GEARBOX_CODE TINYINT NULL,
	HEIGHT_M DECIMAL(5,2) NULL,
	LENGTH_M DECIMAL(5,2) NULL,
	WIDTH_M DECIMAL(5,2) NULL,
	PASSENGER_SEAT_COUNT TINYINT NULL,
	CONSTRAINT PK_VEHICLE PRIMARY KEY (VEHICLE_ID)
);

CREATE TABLE IF NOT EXISTS TEST_SERVICE 
(
	TEST_SERVICE_ID BIGINT NOT NULL,
	EXTENDED_IND TINYINT NOT NULL,
	SPECIAL_NEEDS_CODE VARCHAR(20) NOT NULL,
	TEST_CATEGORY_REF VARCHAR(10) NOT NULL,
	VST_CODE BIGINT NOT NULL,
	CONSTRAINT PK_TEST_SERVICE PRIMARY KEY (TEST_SERVICE_ID)
);

CREATE TABLE IF NOT EXISTS CUSTOMER_ORDER 
(
	ORDER_ID BIGINT NOT NULL,
	BUSINESS_ID BIGINT NULL,
	BOOKER_TYPE_CODE VARCHAR(1) NOT NULL,
	CONSTRAINT PK_CUSTOMER_ORDER PRIMARY KEY (ORDER_ID)
);

CREATE TABLE IF NOT EXISTS CONTACT_DETAILS 
(
	CONTACT_DETAILS_ID BIGINT NOT NULL,
	ORGANISATION_REGISTER_ID DECIMAL(20,2) NULL,
	INDIVIDUAL_ID BIGINT NULL,
	PRIMARY_TEL_NUMBER VARCHAR(20) NULL,
	SECONDARY_TEL_NUMBER VARCHAR(20) NULL,
	EMAIL_ADDRESS VARCHAR(100) NULL,
	MOBILE_TEL_NUMBER VARCHAR(30) NULL,
	PRIM_TEL_VOICEMAIL_IND TINYINT NULL,
	SEC_TEL_VOICEMAIL_IND TINYINT NULL,
	MOBILE_VOICEMAIL_IND TINYINT NULL,
	CONSTRAINT PK_CONTACT_DETAILS PRIMARY KEY (CONTACT_DETAILS_ID)
);

CREATE TABLE IF NOT EXISTS ADDRESS
(
	ADDRESS_ID BIGINT NOT NULL,
	ADDRESS_LINE_1 VARCHAR(255) NOT NULL,
	ADDRESS_LINE_2 VARCHAR(100) NULL,
	ADDRESS_LINE_3 VARCHAR(100) NULL,
	ADDRESS_LINE_4 VARCHAR(100) NULL,
	ADDRESS_LINE_5 VARCHAR(255) NULL,
	POST_CODE VARCHAR(255) NULL,
	ADDRESS_TYPE_CODE BIGINT NULL,
	ORGANISATION_ID BIGINT NULL,
	INDIVIDUAL_ID BIGINT NULL,
	CONSTRAINT PK_ADDRESS PRIMARY KEY (ADDRESS_ID)
);

CREATE TABLE IF NOT EXISTS REGISTER 
(
	INDIVIDUAL_ID BIGINT NULL NULL,
	PRN BIGINT
);

CREATE TABLE IF NOT EXISTS ORGANISATION_REGISTER 
(
	ORGANISATION_REGISTER_ID BIGINT NOT NULL,
	ORGANISATION_ID BIGINT NULL,
	BUSINESS_ID BIGINT NULL,
	CONSTRAINT PK_ORGANISATION_REGISTER PRIMARY KEY (ORGANISATION_REGISTER_ID)
);

CREATE TABLE IF NOT EXISTS ORGANISATION 
(
	ORGANISATION_ID BIGINT NOT NULL,
	ORGANISATION_NAME VARCHAR(100) NULL,
	CONSTRAINT PK_ORGANISATION PRIMARY KEY (ORGANISATION_ID)
);

CREATE TABLE IF NOT EXISTS BOOKING_CANCELLATION_REASON 
(
	BOOKING_CANCEL_REASON_CODE BIGINT NOT NULL,
	INITIATOR_CODE VARCHAR(15) NOT NULL,
	CONSTRAINT PK_BOOKING_CANCELLATION_REASON PRIMARY KEY (BOOKING_CANCEL_REASON_CODE)
);

CREATE TABLE IF NOT EXISTS TEST_HISTORY 
(
	INDIVIDUAL_ID BIGINT NULL,
	EXAM_TYPE_CODE BIGINT NULL,
	DATE_OF_TEST DATETIME NULL,
	RESULT_CODE BIGINT NULL,
	THEORY_PASS_STATE_CODE TINYINT NULL,
	THEORY_TYPE_CODE INT NULL
);

CREATE TABLE IF NOT EXISTS TEST_CATEGORY 
(
	TEST_CATEGORY_REF VARCHAR(10) NOT NULL,
	THEORY_TYPE_CODE INT NOT NULL,
	CONSTRAINT PK_TEST_CATEGORY PRIMARY KEY (TEST_CATEGORY_REF)
);

CREATE TABLE IF NOT EXISTS DES_TEST_CRITERIA (
  EXAMINER_STAFF_NUMBER VARCHAR(10),
  TEST_CATEGORY_REF VARCHAR(10) NOT NULL,
  WITH_EFFECT_FROM DATETIME NOT NULL,
  WITH_EFFECT_TO DATETIME
);

CREATE TABLE IF NOT EXISTS COMMITMENT_AFFECTED_SLOT (
    COMMITMENT_ID DECIMAL(12,0) NOT NULL,
	SLOT_ID DECIMAL(12,0) NOT NULL,
	MODIFICATION_SEQ_NUMBER DECIMAL(12,0),
	CONSTRAINT PK_COMMITMENT_AFFECTED_SLOT PRIMARY KEY (COMMITMENT_ID, SLOT_ID)
);

CREATE TABLE IF NOT EXISTS DRIVER_LICENCE_CATEGORY (
	CURRENT_DRIVER_NUMBER VARCHAR2(16 BYTE) NOT NULL,
	TEST_CATEGORY_REF VARCHAR2(10 BYTE) NOT NULL,
	ENTITLEMENT_START_DATE DATE,
	ENTITLEMENT_TYPE_CODE VARCHAR2(1 BYTE) NOT NULL,
);

CREATE TABLE IF NOT EXISTS APP_SYSTEM_PARAMETER (
	APP_SYS_PARAM_KEY VARCHAR(150 CHAR) NOT NULL,
	DESCRIPTION VARCHAR2(255 CHAR) NOT NULL,
	VALUE VARCHAR2(255 CHAR) NOT NULL,
	EFFECITIVE_FROM DATE NOT NULL,
	EFFECITIVE_TO DATE NULL,
	CONSTRAINT APP_SYSTEM_PARAMETER_PK PRIMARY KEY (APP_SYS_PARAM_KEY,EFFECITIVE_FROM)
);
