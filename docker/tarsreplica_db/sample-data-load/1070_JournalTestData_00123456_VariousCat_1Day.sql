
/****************************************************************************************************************************

Create the examiner and test centre record if they don't already exist

****************************************************************************************************************************/
USE tarsreplica;
-- Initialise variables
SET @TestCentreName 		= 'Scottish Test Centre';
SET @TestCentreCostCode 	= 'SCOT1';
SET @Country			 	= 'Scotland';
SET @StaffNumber			= '00123456';
SET @ExaminerFirstName		= 'MobExaminer';
SET @ExaminerLastName		= '2';
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
-- Cat B, Automatic, Secondary and Mobile Tel, Previous Cancellation, Special Needs Text, Entitlement Check
****************************************************/
-- Set test characteristic variables
SET @SlotHr					= 8;
SET @SlotMinute				= 10;
SET @TestCategoryRef		= 'B';
SET @Minutes				= 57;
SET @NTACode				= NULL;
SET @GearboxType			= 'Automatic';
SET @LargeVehicle			= 0;
SET @DriverNumber			= 'PEARS015220A99HC';
SET @DateOfBirth			= '1979-11-04';
SET @Title					= 'Miss';
SET @FirstName 				= 'Florence';
SET @SecondName 			= NULL;
SET @ThirdName	 			= NULL;
SET @Surname				= 'Pearson';
SET @Ethnicity				= 'A';
SET @Gender					= 'Female';
SET @PrimaryTelNo			= '01234 567890';
SET @SecondaryTelNo			= '04321 098765';
SET @MobileTelNo			= '07654 123456';
SET @EmailAddress			= NULL;
SET @AddressLine1			= '1 Station Street';
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
SET @EntitlementCheck		= 1;
SET @WelshTest				= 0;
SET @SpecialNeedsText		= 'Candidate has dyslexia';
SET @ProgressiveAccess		= 0;
SET @BookingSeq				= 1;
SET @CheckDigit				= 9;

-- Call stored procedure
CALL uspGenerateJournalData(@Date,@IndividualId,@TestCentreId,@CancReason1,@CancReason2,@CancReason3,@SlotHr,@SlotMinute,@TestCategoryRef,@Minutes,@NTACode,@GearboxType,@LargeVehicle,@DriverNumber,@DateOfBirth,@Title,@FirstName,@SecondName,@ThirdName,@Surname,@Gender,@Ethnicity
,@PrimaryTelNo,@SecondaryTelNo,@MobileTelNo,@EmailAddress,@AddressLine1,@AddressLine2,@AddressLine3,@AddressLine4,@AddressLine5,@PostCode,@ExtendedTest,@SpecialNeedsCode,@EntitlementCheck,@WelshTest,@SpecialNeedsText,@ProgressiveAccess,@BookingSeq,@CheckDigit);


/****************************************************
Test Slot 2
-- CPC Lorry, Manual, Full Address, Welsh Test
****************************************************/
-- Set test characteristic variables
SET @SlotHr					= 9;
SET @SlotMinute				= 07;
SET @TestCategoryRef		= 'CCPC';
SET @Minutes				= 30;
SET @NTACode				= NULL;
SET @GearboxType			= 'Manual';
SET @LargeVehicle			= 1;
SET @DriverNumber			= 'QUITO015220A99HC';
SET @DateOfBirth			= '1960-01-04';
SET @Title					= 'Lord';
SET @FirstName 				= 'Amos';
SET @SecondName 			= NULL;
SET @ThirdName	 			= NULL;
SET @Surname				= 'Quito';
SET @Gender					= 'Male';
SET @Ethnicity				= 'B';
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
SET @CancReason1			= NULL;
SET @CancReason2			= NULL;
SET @CancReason3			= NULL;
SET @ExtendedTest			= 0;
SET @SpecialNeedsCode		= 'NONE';
SET @EntitlementCheck		= 0;
SET @WelshTest				= 1;
SET @SpecialNeedsText		= NULL;
SET @ProgressiveAccess		= 0;
SET @BookingSeq				= 5;
SET @CheckDigit				= 2;

-- Call stored procedure
CALL uspGenerateJournalData(@Date,@IndividualId,@TestCentreId,@CancReason1,@CancReason2,@CancReason3,@SlotHr,@SlotMinute,@TestCategoryRef,@Minutes,@NTACode,@GearboxType,@LargeVehicle,@DriverNumber,@DateOfBirth,@Title,@FirstName,@SecondName,@ThirdName,@Surname,@Gender,@Ethnicity
,@PrimaryTelNo,@SecondaryTelNo,@MobileTelNo,@EmailAddress,@AddressLine1,@AddressLine2,@AddressLine3,@AddressLine4,@AddressLine5,@PostCode,@ExtendedTest,@SpecialNeedsCode,@EntitlementCheck,@WelshTest,@SpecialNeedsText,@ProgressiveAccess,@BookingSeq,@CheckDigit);


/****************************************************
Test Slot 3
-- CPC Lorry, Automatic, Mobile Tel, 2 x Previous Cancellations, Special Needs Test, Special Needs Text
****************************************************/
-- Set test characteristic variables
SET @SlotHr					= 9;
SET @SlotMinute				= 37;
SET @TestCategoryRef		= 'CCPC';
SET @Minutes				= 30;
SET @NTACode				= NULL;
SET @GearboxType			= 'Automatic';
SET @LargeVehicle			= 1;
SET @DriverNumber			= 'DOEXX625220A99HC';
SET @DateOfBirth			= '1989-04-10';
SET @Title					= 'Mrs';
SET @FirstName 				= 'Jane';
SET @SecondName 			= NULL;
SET @ThirdName	 			= NULL;
SET @Surname				= 'Doe';
SET @Ethnicity				= 'C';
SET @Gender					= 'Female';
SET @PrimaryTelNo			= NULL;
SET @SecondaryTelNo			= NULL;
SET @MobileTelNo			= '07654 123456';
SET @EmailAddress			= NULL;
SET @AddressLine1			= 'My House';
SET @AddressLine2			= 'Someplace';
SET @AddressLine3			= 'Sometown';
SET @AddressLine4			= NULL;
SET @AddressLine5			= NULL;
SET @PostCode				= 'AB45 6CD';
SET @CancReason1			= 'DSA';
SET @CancReason2			= 'Act of nature';
SET @CancReason3			= NULL;
SET @ExtendedTest			= 0;
SET @SpecialNeedsCode		= 'YES';
SET @EntitlementCheck		= 0;
SET @WelshTest				= 0;
SET @SpecialNeedsText		= 'Candidate has dyslexia';
SET @ProgressiveAccess		= 0;
SET @BookingSeq				= 3;
SET @CheckDigit				= 1;

-- Call stored procedure
CALL uspGenerateJournalData(@Date,@IndividualId,@TestCentreId,@CancReason1,@CancReason2,@CancReason3,@SlotHr,@SlotMinute,@TestCategoryRef,@Minutes,@NTACode,@GearboxType,@LargeVehicle,@DriverNumber,@DateOfBirth,@Title,@FirstName,@SecondName,@ThirdName,@Surname,@Gender,@Ethnicity
,@PrimaryTelNo,@SecondaryTelNo,@MobileTelNo,@EmailAddress,@AddressLine1,@AddressLine2,@AddressLine3,@AddressLine4,@AddressLine5,@PostCode,@ExtendedTest,@SpecialNeedsCode,@EntitlementCheck,@WelshTest,@SpecialNeedsText,@ProgressiveAccess,@BookingSeq,@CheckDigit);


/****************************************************
Test Slot 4
-- Big Bike Mod 2, Manual, Mobile Tel, Extended Test, Entitlement Check
****************************************************/
-- Set test characteristic variables
SET @SlotHr					= 10;
SET @SlotMinute				= 07;
SET @TestCategoryRef		= 'EUAM2';
SET @Minutes				= 114;
SET @NTACode				= NULL;
SET @GearboxType			= 'Manual';
SET @LargeVehicle			= 0;
SET @DriverNumber			= 'SHAWX885220A99HC';
SET @DateOfBirth			= '1991-01-05';
SET @Title					= 'Miss';
SET @FirstName 				= 'Theresa';
SET @SecondName 			= NULL;
SET @ThirdName	 			= NULL;
SET @Surname				= 'Shaw';
SET @Gender					= 'Female';
SET @Ethnicity				= 'D';
SET @PrimaryTelNo			= NULL;
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
SET @ExtendedTest			= 1;
SET @SpecialNeedsCode		= 'NONE';
SET @EntitlementCheck		= 1;
SET @WelshTest				= 0;
SET @SpecialNeedsText		= NULL;
SET @ProgressiveAccess		= 0;
SET @BookingSeq				= 2;
SET @CheckDigit				= 2;

-- Call stored procedure
CALL uspGenerateJournalData(@Date,@IndividualId,@TestCentreId,@CancReason1,@CancReason2,@CancReason3,@SlotHr,@SlotMinute,@TestCategoryRef,@Minutes,@NTACode,@GearboxType,@LargeVehicle,@DriverNumber,@DateOfBirth,@Title,@FirstName,@SecondName,@ThirdName,@Surname,@Gender,@Ethnicity
,@PrimaryTelNo,@SecondaryTelNo,@MobileTelNo,@EmailAddress,@AddressLine1,@AddressLine2,@AddressLine3,@AddressLine4,@AddressLine5,@PostCode,@ExtendedTest,@SpecialNeedsCode,@EntitlementCheck,@WelshTest,@SpecialNeedsText,@ProgressiveAccess,@BookingSeq,@CheckDigit);


/****************************************************
Test Slot 5
-- Standard Bike Mod 1, Manual, Mobile Tel, Entitlement Check
****************************************************/
-- Set test characteristic variables
SET @SlotHr					= 12;
SET @SlotMinute				= 01;
SET @TestCategoryRef		= 'EUA2M1';
SET @Minutes				= 30;
SET @NTACode				= NULL;
SET @GearboxType			= 'Manual';
SET @LargeVehicle			= 0;
SET @DriverNumber			= 'CAMPB805220A89HC';
SET @DateOfBirth			= '1971-07-01';
SET @Title					= 'Mr';
SET @FirstName 				= 'Ali';
SET @SecondName 			= NULL;
SET @ThirdName	 			= NULL;
SET @Surname				= 'Campbell';
SET @Gender					= 'Male';
SET @Ethnicity				= 'E';
SET @PrimaryTelNo			= '01234 567890';
SET @SecondaryTelNo			= NULL;
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
SET @WelshTest				= 0;
SET @SpecialNeedsText		= NULL;
SET @ProgressiveAccess		= 0;
SET @BookingSeq				= 2;
SET @CheckDigit				= 6;

-- Call stored procedure
CALL uspGenerateJournalData(@Date,@IndividualId,@TestCentreId,@CancReason1,@CancReason2,@CancReason3,@SlotHr,@SlotMinute,@TestCategoryRef,@Minutes,@NTACode,@GearboxType,@LargeVehicle,@DriverNumber,@DateOfBirth,@Title,@FirstName,@SecondName,@ThirdName,@Surname,@Gender,@Ethnicity
,@PrimaryTelNo,@SecondaryTelNo,@MobileTelNo,@EmailAddress,@AddressLine1,@AddressLine2,@AddressLine3,@AddressLine4,@AddressLine5,@PostCode,@ExtendedTest,@SpecialNeedsCode,@EntitlementCheck,@WelshTest,@SpecialNeedsText,@ProgressiveAccess,@BookingSeq,@CheckDigit);


/****************************************************
Test Slot 6
-- Moped Mod 2, Manual, Secondary + Mobile Tel, Full Address, Special Needs Extra
****************************************************/
-- Set test characteristic variables
SET @SlotHr					= 13;
SET @SlotMinute				= 01;
SET @TestCategoryRef		= 'EUAMM2';
SET @Minutes				= 86;
SET @NTACode				= NULL;
SET @GearboxType			= 'Manual';
SET @LargeVehicle			= 0;
SET @DriverNumber			= 'BROWN915220A99HC';
SET @DateOfBirth			= '1997-07-26';
SET @Title					= 'Mr';
SET @FirstName 				= 'Jimmy';
SET @SecondName 			= NULL;
SET @ThirdName	 			= NULL;
SET @Surname				= 'Brown';
SET @Gender					= 'Male';
SET @Ethnicity				= 'F';
SET @PrimaryTelNo			= '01234 567890';
SET @SecondaryTelNo			= '04321 098765';
SET @MobileTelNo			= '07654 123456';
SET @EmailAddress			= NULL;
SET @AddressLine1			= 'The Gables Cottage';
SET @AddressLine2			= 'Home Farm';
SET @AddressLine3			= 'Farm Road';
SET @AddressLine4			= 'Farm Area';
SET @AddressLine5			= 'Farmtown';
SET @PostCode				= 'FA43 9XY';
SET @CancReason1			= NULL;
SET @CancReason2			= NULL;
SET @CancReason3			= NULL;
SET @ExtendedTest			= 0;
SET @SpecialNeedsCode		= 'EXTRA';
SET @EntitlementCheck		= 0;
SET @WelshTest				= 0;
SET @SpecialNeedsText		= 'Candidate has dyslexia';
SET @ProgressiveAccess		= 0;
SET @BookingSeq				= 1;
SET @CheckDigit				= 3;

-- Call stored procedure
CALL uspGenerateJournalData(@Date,@IndividualId,@TestCentreId,@CancReason1,@CancReason2,@CancReason3,@SlotHr,@SlotMinute,@TestCategoryRef,@Minutes,@NTACode,@GearboxType,@LargeVehicle,@DriverNumber,@DateOfBirth,@Title,@FirstName,@SecondName,@ThirdName,@Surname,@Gender,@Ethnicity
,@PrimaryTelNo,@SecondaryTelNo,@MobileTelNo,@EmailAddress,@AddressLine1,@AddressLine2,@AddressLine3,@AddressLine4,@AddressLine5,@PostCode,@ExtendedTest,@SpecialNeedsCode,@EntitlementCheck,@WelshTest,@SpecialNeedsText,@ProgressiveAccess,@BookingSeq,@CheckDigit);


/****************************************************
Test Slot 7
-- Passenger Carrying Vehicle with Trailer, Manual, Previous Cancellation, Welsh Test
****************************************************/
-- Set test characteristic variables
SET @SlotHr					= 14;
SET @SlotMinute				= 25;
SET @TestCategoryRef		= 'D+E';
SET @Minutes				= 90;
SET @NTACode				= NULL;
SET @GearboxType			= 'Manual';
SET @LargeVehicle			= 1;
SET @DriverNumber			= 'SMYTH375220A99HC';
SET @DateOfBirth			= '1985-08-10';
SET @Title					= 'Captain';
SET @FirstName 				= 'Montague';
SET @SecondName 			= NULL;
SET @ThirdName	 			= NULL;
SET @Surname				= 'Smythe';
SET @Gender					= 'Male';
SET @Ethnicity				= 'G';
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
SET @CancReason1			= 'DSA';
SET @CancReason2			= NULL;
SET @CancReason3			= NULL;
SET @ExtendedTest			= 0;
SET @SpecialNeedsCode		= 'NONE';
SET @EntitlementCheck		= 0;
SET @WelshTest				= 1;
SET @SpecialNeedsText		= NULL;
SET @ProgressiveAccess		= 0;
SET @BookingSeq				= 2;
SET @CheckDigit				= 7;

-- Call stored procedure
CALL uspGenerateJournalData(@Date,@IndividualId,@TestCentreId,@CancReason1,@CancReason2,@CancReason3,@SlotHr,@SlotMinute,@TestCategoryRef,@Minutes,@NTACode,@GearboxType,@LargeVehicle,@DriverNumber,@DateOfBirth,@Title,@FirstName,@SecondName,@ThirdName,@Surname,@Gender,@Ethnicity
,@PrimaryTelNo,@SecondaryTelNo,@MobileTelNo,@EmailAddress,@AddressLine1,@AddressLine2,@AddressLine3,@AddressLine4,@AddressLine5,@PostCode,@ExtendedTest,@SpecialNeedsCode,@EntitlementCheck,@WelshTest,@SpecialNeedsText,@ProgressiveAccess,@BookingSeq,@CheckDigit);

/****************************************************
Test Slot 8
-- Passenger Carrying Vehicle with Trailer, Manual, Previous Cancellation, Welsh Test
****************************************************/
-- Set test characteristic variables
SET @SlotHr					= 15;
SET @SlotMinute				= 25;
SET @TestCategoryRef		= 'B';
SET @Minutes				= 90;
SET @NTACode				= NULL;
SET @GearboxType			= 'Manual';
SET @LargeVehicle			= 1;
SET @DriverNumber			= 'TESTH375220A99HC';
SET @DateOfBirth			= '1985-08-10';
SET @Title					= 'Mr';
SET @FirstName 				= 'TEST';
SET @SecondName 			= NULL;
SET @ThirdName	 			= NULL;
SET @Surname				= 'TESTER';
SET @Gender					= 'Male';
SET @Ethnicity				= 'G';
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
SET @CancReason1			= 'DSA';
SET @CancReason2			= NULL;
SET @CancReason3			= NULL;
SET @ExtendedTest			= 0;
SET @SpecialNeedsCode		= 'NONE';
SET @EntitlementCheck		= 0;
SET @WelshTest				= 1;
SET @SpecialNeedsText		= NULL;
SET @ProgressiveAccess		= 0;
SET @BookingSeq				= 3;
SET @CheckDigit				= 7;

-- Call stored procedure
CALL uspGenerateJournalData(@Date,@IndividualId,@TestCentreId,@CancReason1,@CancReason2,@CancReason3,@SlotHr,@SlotMinute,@TestCategoryRef,@Minutes,@NTACode,@GearboxType,@LargeVehicle,@DriverNumber,@DateOfBirth,@Title,@FirstName,@SecondName,@ThirdName,@Surname,@Gender,@Ethnicity
,@PrimaryTelNo,@SecondaryTelNo,@MobileTelNo,@EmailAddress,@AddressLine1,@AddressLine2,@AddressLine3,@AddressLine4,@AddressLine5,@PostCode,@ExtendedTest,@SpecialNeedsCode,@EntitlementCheck,@WelshTest,@SpecialNeedsText,@ProgressiveAccess,@BookingSeq,@CheckDigit);