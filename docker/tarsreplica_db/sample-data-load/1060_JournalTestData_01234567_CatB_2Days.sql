
/****************************************************************************************************************************

Create the examiner and test centre record if they don't already exist

****************************************************************************************************************************/
USE tarsreplica;
-- Initialise variables
SET @TestCentreName 		= 'Example Test Centre';
SET @TestCentreCostCode 	= 'EXTC1';
SET @Country			 	= 'England';
SET @StaffNumber			= '01234567';
SET @ExaminerFirstName		= 'MobExaminer';
SET @ExaminerLastName		= '1';
SET @Date					= CURRENT_DATE;

CALL uspGenerateExaminerData(@TestCentreName,@TestCentreCostCode,@Country,@StaffNumber,@ExaminerFirstName,@ExaminerLastName,@Date);


/****************************************************************************************************************************

Create the programme

****************************************************************************************************************************/
SET @IndividualId			= (SELECT individual_id FROM EXAMINER WHERE staff_number = @StaffNumber);
SET @TestCentreId			= (SELECT tc_id FROM TEST_CENTRE WHERE tc_cost_centre_code = @TestCentreCostCode);

-- PROGRAMME
INSERT INTO PROGRAMME (individual_id, programme_date, tc_id, state_code)
SELECT @IndividualId, @Date, @TestCentreId, 1
FROM DUAL;


/****************************************************************************************************************************

Create the slots, including booking, application, individual, etc.

****************************************************************************************************************************/
/****************************************************
Test Slot 1
-- Simple Cat B, Automatic
****************************************************/
-- Set test characteristic variables
SET @SlotHr					= 8;
SET @SlotMinute				= 40;
SET @TestCategoryRef		= 'B';
SET @Minutes				= 57;
SET @NTACode				= NULL;
SET @GearboxType			= 'Automatic';
SET @LargeVehicle			= 0;
SET @DriverNumber			= 'PEARS015220A99HC';
SET @DateOfBirth			= '1987-06-27';
SET @Title					= 'Miss';
SET @FirstName 				= 'Florence';
SET @SecondName 			= NULL;
SET @ThirdName	 			= NULL;
SET @Surname				= 'Pearson';
SET @Gender					= 'Female';
SET @Ethnicity				= 'A';
SET @PrimaryTelNo			= '01234 567890';
SET @SecondaryTelNo			= NULL;
SET @MobileTelNo			= NULL;
SET @EmailAddress			= NULL;
SET @AddressLine1			= '1234 Station Street';
SET @AddressLine2			= 'Sometown';
SET @AddressLine3			= NULL;
SET @AddressLine4			= NULL;
SET @AddressLine5			= NULL;
SET @PostCode				= 'AB12 3CD';
SET @CancReason1			= NULL;
SET @CancReason2			= NULL;
SET @CancReason3			= NULL;
SET @ExtendedTest			= 0;
SET @SpecialNeedsCode		= 'NONE';
SET @EntitlementCheck		= 0;
SET @WelshTest				= 0;
SET @SpecialNeedsText		= NULL;
SET @ProgressiveAccess		= 0;
SET @BookingSeq				= 1;
SET @CheckDigit				= 1;

-- Call stored procedure
CALL uspGenerateJournalData(@Date,@IndividualId,@TestCentreId,@CancReason1,@CancReason2,@CancReason3,@SlotHr,@SlotMinute,@TestCategoryRef,@Minutes,@NTACode,@GearboxType,@LargeVehicle,@DriverNumber,@DateOfBirth,@Title,@FirstName,@SecondName,@ThirdName,@Surname,@Gender,@Ethnicity
,@PrimaryTelNo,@SecondaryTelNo,@MobileTelNo,@EmailAddress,@AddressLine1,@AddressLine2,@AddressLine3,@AddressLine4,@AddressLine5,@PostCode,@ExtendedTest,@SpecialNeedsCode,@EntitlementCheck,@WelshTest,@SpecialNeedsText,@ProgressiveAccess,@BookingSeq,@CheckDigit);


/****************************************************
Test Slot 2
-- Cat B, Manual, Welsh, Secondary Tel
****************************************************/
-- Set test characteristic variables
SET @SlotHr					= 9;
SET @SlotMinute				= 37;
SET @TestCategoryRef		= 'B';
SET @Minutes				= 57;
SET @NTACode				= NULL;
SET @GearboxType			= 'Manual';
SET @LargeVehicle			= 0;
SET @DriverNumber			= 'DOEXX625220A99HC';
SET @DateOfBirth			= '1960-09-05';
SET @Title					= 'Mrs';
SET @FirstName 				= 'Jane';
SET @SecondName 			= NULL;
SET @ThirdName	 			= NULL;
SET @Surname				= 'Doe';
SET @Gender					= 'Female';
SET @Ethnicity				= 'B';
SET @PrimaryTelNo			= '01234 567890';
SET @SecondaryTelNo			= '04321 098765';
SET @MobileTelNo			= NULL;
SET @EmailAddress			= NULL;
SET @AddressLine1			= 'My House';
SET @AddressLine2			= 'Someplace';
SET @AddressLine3			= 'Sometown';
SET @AddressLine4			= NULL;
SET @AddressLine5			= NULL;
SET @PostCode				= 'AB45 6CD';
SET @CancReason1			= NULL;
SET @CancReason2			= NULL;
SET @CancReason3			= NULL;
SET @ExtendedTest			= 0;
SET @SpecialNeedsCode		= 'NONE';
SET @EntitlementCheck		= 0;
SET @WelshTest				= 1;
SET @SpecialNeedsText		= NULL;
SET @ProgressiveAccess		= 0;
SET @BookingSeq				= 1;
SET @CheckDigit				= 9;

-- Call stored procedure
CALL uspGenerateJournalData(@Date,@IndividualId,@TestCentreId,@CancReason1,@CancReason2,@CancReason3,@SlotHr,@SlotMinute,@TestCategoryRef,@Minutes,@NTACode,@GearboxType,@LargeVehicle,@DriverNumber,@DateOfBirth,@Title,@FirstName,@SecondName,@ThirdName,@Surname,@Gender,@Ethnicity
,@PrimaryTelNo,@SecondaryTelNo,@MobileTelNo,@EmailAddress,@AddressLine1,@AddressLine2,@AddressLine3,@AddressLine4,@AddressLine5,@PostCode,@ExtendedTest,@SpecialNeedsCode,@EntitlementCheck,@WelshTest,@SpecialNeedsText,@ProgressiveAccess,@BookingSeq,@CheckDigit);


/****************************************************
Test Slot 3
-- Cat B, Manual, Entitlement Check, Mobile Tel
****************************************************/
-- Set test characteristic variables
SET @SlotHr					= 10;
SET @SlotMinute				= 44;
SET @TestCategoryRef		= 'B';
SET @Minutes				= 57;
SET @NTACode				= NULL;
SET @GearboxType			= 'Manual';
SET @LargeVehicle			= 0;
SET @DriverNumber			= 'SHAWX885220A99HC';
SET @DateOfBirth			= '1962-03-05';
SET @Title					= 'Miss';
SET @FirstName 				= 'Theresa';
SET @SecondName 			= NULL;
SET @ThirdName	 			= NULL;
SET @Surname				= 'Shaw';
SET @Gender					= 'Female';
SET @Ethnicity				= 'C';
SET @PrimaryTelNo			= '01234 567890';
SET @SecondaryTelNo			= NULL;
SET @MobileTelNo			= '07654 123456';
SET @EmailAddress			= NULL;
SET @AddressLine1			= '999 Letsby Avenue';
SET @AddressLine2			= 'Someplace';
SET @AddressLine3			= 'Sometown';
SET @AddressLine4			= NULL;
SET @AddressLine5			= NULL;
SET @PostCode				= 'AB67 8CD';
SET @CancReason1			= NULL;
SET @CancReason2			= NULL;
SET @CancReason3			= NULL;
SET @ExtendedTest			= 0;
SET @SpecialNeedsCode		= 'NONE';
SET @EntitlementCheck		= 1;
SET @WelshTest				= 0;
SET @SpecialNeedsText		= NULL;
SET @ProgressiveAccess		= 0;
SET @BookingSeq				= 1;
SET @CheckDigit				= 2;

-- Call stored procedure
CALL uspGenerateJournalData(@Date,@IndividualId,@TestCentreId,@CancReason1,@CancReason2,@CancReason3,@SlotHr,@SlotMinute,@TestCategoryRef,@Minutes,@NTACode,@GearboxType,@LargeVehicle,@DriverNumber,@DateOfBirth,@Title,@FirstName,@SecondName,@ThirdName,@Surname,@Gender,@Ethnicity
,@PrimaryTelNo,@SecondaryTelNo,@MobileTelNo,@EmailAddress,@AddressLine1,@AddressLine2,@AddressLine3,@AddressLine4,@AddressLine5,@PostCode,@ExtendedTest,@SpecialNeedsCode,@EntitlementCheck,@WelshTest,@SpecialNeedsText,@ProgressiveAccess,@BookingSeq,@CheckDigit);


/****************************************************
Test Slot 4
-- Cat B, Automatic, Welsh Test, Entitlement Check, Secondary + Mobile Tel
****************************************************/
-- Set test characteristic variables
SET @SlotHr					= 11;
SET @SlotMinute				= 41;
SET @TestCategoryRef		= 'B';
SET @Minutes				= 57;
SET @NTACode				= NULL;
SET @GearboxType			= 'Automatic';
SET @LargeVehicle			= 0;
SET @DriverNumber			= 'CAMPB805220A89HC';
SET @DateOfBirth			= '1974-09-15';
SET @Title					= 'Mr';
SET @FirstName 				= 'Ali';
SET @SecondName 			= NULL;
SET @ThirdName	 			= NULL;
SET @Surname				= 'Campbell';
SET @Gender					= 'Male';
SET @Ethnicity				= 'D';
SET @PrimaryTelNo			= '01234 567890';
SET @SecondaryTelNo			= '04321 098765';
SET @MobileTelNo			= '07654 123456';
SET @EmailAddress			= NULL;
SET @AddressLine1			= '1 Station Street';
SET @AddressLine2			= 'Someplace';
SET @AddressLine3			= 'Somearea';
SET @AddressLine4			= 'Somecity';
SET @AddressLine5			= NULL;
SET @PostCode				= 'UB40 1AA';
SET @CancReason1			= NULL;
SET @CancReason2			= NULL;
SET @CancReason3			= NULL;
SET @ExtendedTest			= 0;
SET @SpecialNeedsCode		= 'NONE';
SET @EntitlementCheck		= 1;
SET @WelshTest				= 1;
SET @SpecialNeedsText		= NULL;
SET @ProgressiveAccess		= 0;
SET @BookingSeq				= 1;
SET @CheckDigit				= 6;

-- Call stored procedure
CALL uspGenerateJournalData(@Date,@IndividualId,@TestCentreId,@CancReason1,@CancReason2,@CancReason3,@SlotHr,@SlotMinute,@TestCategoryRef,@Minutes,@NTACode,@GearboxType,@LargeVehicle,@DriverNumber,@DateOfBirth,@Title,@FirstName,@SecondName,@ThirdName,@Surname,@Gender,@Ethnicity
,@PrimaryTelNo,@SecondaryTelNo,@MobileTelNo,@EmailAddress,@AddressLine1,@AddressLine2,@AddressLine3,@AddressLine4,@AddressLine5,@PostCode,@ExtendedTest,@SpecialNeedsCode,@EntitlementCheck,@WelshTest,@SpecialNeedsText,@ProgressiveAccess,@BookingSeq,@CheckDigit);


/****************************************************
Test Slot 5
-- Cat B, Manual, Full Address, Previous Cancellation, Special Needs Text
****************************************************/
-- Set test characteristic variables
SET @SlotHr					= 13;
SET @SlotMinute				= 03;
SET @TestCategoryRef		= 'B';
SET @Minutes				= 57;
SET @NTACode				= NULL;
SET @GearboxType			= 'Manual';
SET @LargeVehicle			= 0;
SET @DriverNumber			= 'BROWN915220A99HC';
SET @DateOfBirth			= '1983-11-11';
SET @Title					= 'Mr';
SET @FirstName 				= 'James';
SET @SecondName 			= NULL;
SET @ThirdName	 			= NULL;
SET @Surname				= 'Brown';
SET @Gender					= 'Male';
SET @Ethnicity				= 'E';
SET @PrimaryTelNo			= '01234 567890';
SET @SecondaryTelNo			= NULL;
SET @MobileTelNo			= NULL;
SET @EmailAddress			= NULL;
SET @AddressLine1			= 'The Gables Cottage';
SET @AddressLine2			= 'Home Farm';
SET @AddressLine3			= 'Farm Road';
SET @AddressLine4			= 'Farm Area';
SET @AddressLine5			= 'Farmtown';
SET @PostCode				= 'FA43 9XY';
SET @CancReason1			= 'Act of nature';
SET @CancReason2			= NULL;
SET @CancReason3			= NULL;
SET @ExtendedTest			= 0;
SET @SpecialNeedsCode		= 'NONE';
SET @EntitlementCheck		= 0;
SET @WelshTest				= 0;
SET @SpecialNeedsText		= 'Candidate has dyslexia';
SET @ProgressiveAccess		= 0;
SET @BookingSeq				= 2;
SET @CheckDigit				= 3;

-- Call stored procedure
CALL uspGenerateJournalData(@Date,@IndividualId,@TestCentreId,@CancReason1,@CancReason2,@CancReason3,@SlotHr,@SlotMinute,@TestCategoryRef,@Minutes,@NTACode,@GearboxType,@LargeVehicle,@DriverNumber,@DateOfBirth,@Title,@FirstName,@SecondName,@ThirdName,@Surname,@Gender,@Ethnicity
,@PrimaryTelNo,@SecondaryTelNo,@MobileTelNo,@EmailAddress,@AddressLine1,@AddressLine2,@AddressLine3,@AddressLine4,@AddressLine5,@PostCode,@ExtendedTest,@SpecialNeedsCode,@EntitlementCheck,@WelshTest,@SpecialNeedsText,@ProgressiveAccess,@BookingSeq,@CheckDigit);


/****************************************************
Test Slot 6
-- Cat B, Manual, 3 x Previous Cancellations, Extended Test
****************************************************/
-- Set test characteristic variables
SET @SlotHr					= 14;
SET @SlotMinute				= 00;
SET @TestCategoryRef		= 'B';
SET @Minutes				= 114;
SET @NTACode				= NULL;
SET @GearboxType			= 'Manual';
SET @LargeVehicle			= 0;
SET @DriverNumber			= 'SMYTH375220A99HC';
SET @DateOfBirth			= '1973-10-05';
SET @Title					= 'Captain';
SET @FirstName 				= 'Montague';
SET @SecondName 			= NULL;
SET @ThirdName	 			= NULL;
SET @Surname				= 'Smythe';
SET @Gender					= 'Male';
SET @Ethnicity				= 'F';
SET @PrimaryTelNo			= '01234 567890';
SET @SecondaryTelNo			= NULL;
SET @MobileTelNo			= NULL;
SET @EmailAddress			= NULL;
SET @AddressLine1			= '1 Hangar Lane';
SET @AddressLine2			= 'Someplace';
SET @AddressLine3			= 'Sometown';
SET @AddressLine4			= NULL;
SET @AddressLine5			= NULL;
SET @PostCode				= 'AB78 9CD';
SET @CancReason1			= 'Act of nature';
SET @CancReason2			= 'Act of nature';
SET @CancReason3			= 'DSA';
SET @ExtendedTest			= 1;
SET @SpecialNeedsCode		= 'NONE';
SET @EntitlementCheck		= 0;
SET @WelshTest				= 0;
SET @SpecialNeedsText		= NULL;
SET @ProgressiveAccess		= 0;
SET @BookingSeq				= 4;
SET @CheckDigit				= 7;

-- Call stored procedure
CALL uspGenerateJournalData(@Date,@IndividualId,@TestCentreId,@CancReason1,@CancReason2,@CancReason3,@SlotHr,@SlotMinute,@TestCategoryRef,@Minutes,@NTACode,@GearboxType,@LargeVehicle,@DriverNumber,@DateOfBirth,@Title,@FirstName,@SecondName,@ThirdName,@Surname,@Gender,@Ethnicity
,@PrimaryTelNo,@SecondaryTelNo,@MobileTelNo,@EmailAddress,@AddressLine1,@AddressLine2,@AddressLine3,@AddressLine4,@AddressLine5,@PostCode,@ExtendedTest,@SpecialNeedsCode,@EntitlementCheck,@WelshTest,@SpecialNeedsText,@ProgressiveAccess,@BookingSeq,@CheckDigit);


/****************************************************************************************************************************

Create the programme (next day)

****************************************************************************************************************************/
-- Increment date variable to represent the next working day
SET @Date					= (SELECT getJournalEndDate(1,@Date));

-- PROGRAMME
INSERT INTO PROGRAMME (individual_id, programme_date, tc_id, state_code)
SELECT @IndividualId, @Date, @TestCentreId, 1
FROM DUAL;


/****************************************************
Test Slot 1 (next day)
-- Cat B, Automatic, 2 x Previous Cancellations, Special Needs Test, Mobile Tel
****************************************************/
-- Set test characteristic variables
SET @SlotHr					= 8;
SET @SlotMinute				= 40;
SET @TestCategoryRef		= 'B';
SET @Minutes				= 57;
SET @NTACode				= NULL;
SET @GearboxType			= 'Automatic';
SET @LargeVehicle			= 0;
SET @DriverNumber			= 'POTSX015220A99HC';
SET @DateOfBirth			= '1985-03-04';
SET @Title					= 'Mr';
SET @FirstName 				= 'Bill';
SET @SecondName 			= NULL;
SET @ThirdName	 			= NULL;
SET @Surname				= 'Pots';
SET @Gender					= 'Male';
SET @Ethnicity				= 'G';
SET @PrimaryTelNo			= '01234 567890';
SET @SecondaryTelNo			= NULL;
SET @MobileTelNo			= '07654 123456';
SET @EmailAddress			= NULL;
SET @AddressLine1			= '1234 Station Street';
SET @AddressLine2			= 'Someplace';
SET @AddressLine3			= 'Sometown';
SET @AddressLine4			= NULL;
SET @AddressLine5			= NULL;
SET @PostCode				= 'AB12 3CD';
SET @CancReason1			= 'Act of nature';
SET @CancReason2			= 'DSA';
SET @CancReason3			= NULL;
SET @ExtendedTest			= 0;
SET @SpecialNeedsCode		= 'YES';
SET @EntitlementCheck		= 0;
SET @WelshTest				= 0;
SET @SpecialNeedsText		= NULL;
SET @ProgressiveAccess		= 0;
SET @BookingSeq				= 3;
SET @CheckDigit				= 1;

-- Call stored procedure
CALL uspGenerateJournalData(@Date,@IndividualId,@TestCentreId,@CancReason1,@CancReason2,@CancReason3,@SlotHr,@SlotMinute,@TestCategoryRef,@Minutes,@NTACode,@GearboxType,@LargeVehicle,@DriverNumber,@DateOfBirth,@Title,@FirstName,@SecondName,@ThirdName,@Surname,@Gender,@Ethnicity
,@PrimaryTelNo,@SecondaryTelNo,@MobileTelNo,@EmailAddress,@AddressLine1,@AddressLine2,@AddressLine3,@AddressLine4,@AddressLine5,@PostCode,@ExtendedTest,@SpecialNeedsCode,@EntitlementCheck,@WelshTest,@SpecialNeedsText,@ProgressiveAccess,@BookingSeq,@CheckDigit);


/****************************************************
Test Slot 2 (next day)
-- Cat B, Automatic, Extra Special Needs Test, Secondary + Mobile Tel
****************************************************/
-- Set test characteristic variables
SET @SlotHr					= 9;
SET @SlotMinute				= 37;
SET @TestCategoryRef		= 'B';
SET @Minutes				= 86;
SET @NTACode				= NULL;
SET @GearboxType			= 'Automatic';
SET @LargeVehicle			= 0;
SET @DriverNumber			= 'COOPE625220A99HC';
SET @DateOfBirth			= '1975-09-01';
SET @Title					= 'Miss';
SET @FirstName 				= 'Alice';
SET @SecondName 			= NULL;
SET @ThirdName	 			= NULL;
SET @Surname				= 'Cooper';
SET @Gender					= 'Female';
SET @Ethnicity				= 'A';
SET @PrimaryTelNo			= '01234 567890';
SET @SecondaryTelNo			= '04321 098765';
SET @MobileTelNo			= '07654 123456';
SET @EmailAddress			= NULL;
SET @AddressLine1			= 'My House';
SET @AddressLine2			= 'Someplace';
SET @AddressLine3			= 'Sometown';
SET @AddressLine4			= NULL;
SET @AddressLine5			= NULL;
SET @PostCode				= 'AB45 6CD';
SET @CancReason1			= NULL;
SET @CancReason2			= NULL;
SET @CancReason3			= NULL;
SET @ExtendedTest			= 0;
SET @SpecialNeedsCode		= 'EXTRA';
SET @EntitlementCheck		= 0;
SET @WelshTest				= 0;
SET @SpecialNeedsText		= NULL;
SET @ProgressiveAccess		= 0;
SET @BookingSeq				= 1;
SET @CheckDigit				= 1;

-- Call stored procedure
CALL uspGenerateJournalData(@Date,@IndividualId,@TestCentreId,@CancReason1,@CancReason2,@CancReason3,@SlotHr,@SlotMinute,@TestCategoryRef,@Minutes,@NTACode,@GearboxType,@LargeVehicle,@DriverNumber,@DateOfBirth,@Title,@FirstName,@SecondName,@ThirdName,@Surname,@Gender,@Ethnicity
,@PrimaryTelNo,@SecondaryTelNo,@MobileTelNo,@EmailAddress,@AddressLine1,@AddressLine2,@AddressLine3,@AddressLine4,@AddressLine5,@PostCode,@ExtendedTest,@SpecialNeedsCode,@EntitlementCheck,@WelshTest,@SpecialNeedsText,@ProgressiveAccess,@BookingSeq,@CheckDigit);


/****************************************************
Test Slot 3 (next day)
-- Cat B, Manual, Special Needs Test, Extended Test, Special Needs Text, Entitlement Check, Secondary Tel
****************************************************/
-- Set test characteristic variables
SET @SlotHr					= 11;
SET @SlotMinute				= 03;
SET @TestCategoryRef		= 'B';
SET @Minutes				= 114;
SET @NTACode				= NULL;
SET @GearboxType			= 'Manual';
SET @LargeVehicle			= 0;
SET @DriverNumber			= 'BUXTO015220A99HC';
SET @DateOfBirth			= '1977-10-16';
SET @Title					= 'Mr';
SET @FirstName 				= 'Phil';
SET @SecondName 			= NULL;
SET @ThirdName	 			= NULL;
SET @Surname				= 'Buxton';
SET @Gender					= 'Male';
SET @Ethnicity				= 'B';
SET @PrimaryTelNo			= '01234 567890';
SET @SecondaryTelNo			= '04321 098765';
SET @MobileTelNo			= NULL;
SET @EmailAddress			= NULL;
SET @AddressLine1			= '1234 Station Street';
SET @AddressLine2			= 'Someplace';
SET @AddressLine3			= 'Sometown';
SET @AddressLine4			= NULL;
SET @AddressLine5			= NULL;
SET @PostCode				= 'AB12 3CD';
SET @CancReason1			= NULL;
SET @CancReason2			= NULL;
SET @CancReason3			= NULL;
SET @ExtendedTest			= 1;
SET @SpecialNeedsCode		= 'YES';
SET @EntitlementCheck		= 1;
SET @WelshTest				= 0;
SET @SpecialNeedsText		= 'Candidate has dyslexia';
SET @ProgressiveAccess		= 0;
SET @BookingSeq				= 1;
SET @CheckDigit				= 1;

-- Call stored procedure
CALL uspGenerateJournalData(@Date,@IndividualId,@TestCentreId,@CancReason1,@CancReason2,@CancReason3,@SlotHr,@SlotMinute,@TestCategoryRef,@Minutes,@NTACode,@GearboxType,@LargeVehicle,@DriverNumber,@DateOfBirth,@Title,@FirstName,@SecondName,@ThirdName,@Surname,@Gender,@Ethnicity
,@PrimaryTelNo,@SecondaryTelNo,@MobileTelNo,@EmailAddress,@AddressLine1,@AddressLine2,@AddressLine3,@AddressLine4,@AddressLine5,@PostCode,@ExtendedTest,@SpecialNeedsCode,@EntitlementCheck,@WelshTest,@SpecialNeedsText,@ProgressiveAccess,@BookingSeq,@CheckDigit);


/****************************************************
Test Slot 4 (next day)
-- Non Test Activity (Corporate Connectivity)
****************************************************/
-- Set test characteristic variables
SET @SlotHr					= 13;
SET @SlotMinute				= 27;
SET @TestCategoryRef		= NULL;
SET @Minutes				= 57;
SET @NTACode				= '198';
SET @GearboxType			= NULL;
SET @LargeVehicle			= NULL;
SET @DriverNumber			= NULL;
SET @DateOfBirth			= NULL;
SET @Title					= NULL;
SET @FirstName 				= NULL;
SET @SecondName 			= NULL;
SET @ThirdName	 			= NULL;
SET @Surname				= NULL;
SET @Gender					= NULL;
SET @Ethnicity				= NULL;
SET @PrimaryTelNo			= NULL;
SET @SecondaryTelNo			= NULL;
SET @MobileTelNo			= NULL;
SET @EmailAddress			= NULL;
SET @AddressLine1			= NULL;
SET @AddressLine2			= NULL;
SET @AddressLine3			= NULL;
SET @AddressLine4			= NULL;
SET @AddressLine5			= NULL;
SET @PostCode				= NULL;
SET @CancReason1			= NULL;
SET @CancReason2			= NULL;
SET @CancReason3			= NULL;
SET @ExtendedTest			= NULL;
SET @SpecialNeedsCode		= NULL;
SET @EntitlementCheck		= NULL;
SET @WelshTest				= NULL;
SET @SpecialNeedsText		= NULL;
SET @ProgressiveAccess		= NULL;
SET @BookingSeq				= NULL;
SET @CheckDigit				= NULL;

-- Call stored procedure
CALL uspGenerateJournalData(@Date,@IndividualId,@TestCentreId,@CancReason1,@CancReason2,@CancReason3,@SlotHr,@SlotMinute,@TestCategoryRef,@Minutes,@NTACode,@GearboxType,@LargeVehicle,@DriverNumber,@DateOfBirth,@Title,@FirstName,@SecondName,@ThirdName,@Surname,@Gender,@Ethnicity
,@PrimaryTelNo,@SecondaryTelNo,@MobileTelNo,@EmailAddress,@AddressLine1,@AddressLine2,@AddressLine3,@AddressLine4,@AddressLine5,@PostCode,@ExtendedTest,@SpecialNeedsCode,@EntitlementCheck,@WelshTest,@SpecialNeedsText,@ProgressiveAccess,@BookingSeq,@CheckDigit);


/****************************************************************************************************************************

Change Test Centre

****************************************************************************************************************************/
-- Initialise variables
SET @TestCentreName 		= 'Welsh Test Centre';
SET @TestCentreCostCode 	= 'EXTC3';
SET @Country			 	= 'Wales';

-- Call stored procedure
CALL uspGenerateExaminerData(@TestCentreName,@TestCentreCostCode,@Country,@StaffNumber,@ExaminerFirstName,@ExaminerLastName,@Date);

SET @IndividualId			= (SELECT individual_id FROM EXAMINER WHERE staff_number = @StaffNumber);
SET @TestCentreId			= (SELECT tc_id FROM TEST_CENTRE WHERE tc_cost_centre_code = @TestCentreCostCode);

-- PROGRAMME
INSERT INTO PROGRAMME (individual_id, programme_date, tc_id, state_code)
SELECT @IndividualId, @Date, @TestCentreId, 1
FROM DUAL;


/****************************************************
Test Slot 5 (next day)
-- Cat B, Automatic, Mobile Tel, Previous Cancellation, 2 x Middle Names, Welsh Test, Special Needs Text
****************************************************/
-- Set test characteristic variables
SET @SlotHr					= 14;
SET @SlotMinute				= 24;
SET @TestCategoryRef		= 'B';
SET @Minutes				= 57;
SET @NTACode				= NULL;
SET @GearboxType			= 'Automatic';
SET @LargeVehicle			= 0;
SET @DriverNumber			= 'TOLKI015220A99HC';
SET @DateOfBirth			= '1977-10-16';
SET @Title					= 'Mr';
SET @FirstName 				= 'John';
SET @SecondName 			= 'Ronald';
SET @ThirdName	 			= 'Reuel';
SET @Surname				= 'Tolkien';
SET @Gender					= 'Male';
SET @Ethnicity				= 'C';
SET @PrimaryTelNo			= '01234 567890';
SET @SecondaryTelNo			= NULL;
SET @MobileTelNo			= '07654 123456';
SET @EmailAddress			= NULL;
SET @AddressLine1			= '1234 Station Street';
SET @AddressLine2			= 'Someplace';
SET @AddressLine3			= 'Sometown';
SET @AddressLine4			= NULL;
SET @AddressLine5			= NULL;
SET @PostCode				= 'AB12 3CD';
SET @CancReason1			= 'Act of nature';
SET @CancReason2			= NULL;
SET @CancReason3			= NULL;
SET @ExtendedTest			= 0;
SET @SpecialNeedsCode		= 'NONE';
SET @EntitlementCheck		= 0;
SET @WelshTest				= 1;
SET @SpecialNeedsText		= 'Candidate is pregnant';
SET @ProgressiveAccess		= 0;
SET @BookingSeq				= 2;
SET @CheckDigit				= 5;

-- Call stored procedure
CALL uspGenerateJournalData(@Date,@IndividualId,@TestCentreId,@CancReason1,@CancReason2,@CancReason3,@SlotHr,@SlotMinute,@TestCategoryRef,@Minutes,@NTACode,@GearboxType,@LargeVehicle,@DriverNumber,@DateOfBirth,@Title,@FirstName,@SecondName,@ThirdName,@Surname,@Gender,@Ethnicity
,@PrimaryTelNo,@SecondaryTelNo,@MobileTelNo,@EmailAddress,@AddressLine1,@AddressLine2,@AddressLine3,@AddressLine4,@AddressLine5,@PostCode,@ExtendedTest,@SpecialNeedsCode,@EntitlementCheck,@WelshTest,@SpecialNeedsText,@ProgressiveAccess,@BookingSeq,@CheckDigit);