USE tarsreplica;
DELIMITER //
//
  
/*
* Determines the number of previous ADI test attempts.
*/
DROP FUNCTION IF EXISTS getPreviousADIAttempts
//
  
CREATE FUNCTION getPreviousADIAttempts(p_candidate_id INT, p_vehicle_category varchar(30) ) returns INT
    BEGIN
        DECLARE l_part1_date  DATE;
        DECLARE l_count       INT;
/*
* This logic is taken from the Journal reports - to calculate the number of ADI part 2 or 3 attempts since
* the examiner's latest ADI part 1 (theory) attempt
*
* In practice the eligability logic is more restrictive than this but TARS should have applied that when the
* test is booked, and we don't want top replicate all that logic here...
*/
        SELECT MAX(date_of_test) INTO l_part1_date
        FROM TEST_HISTORY
        WHERE individual_id = p_candidate_id
            AND exam_type_code = 2097;
 
        SELECT COUNT(*) INTO l_count
        FROM TEST_HISTORY t, REF_DATA_ITEM_MASTER category_ref, REF_DATA_ITEM_MASTER result_ref
        WHERE t.individual_id = p_candidate_id
            AND t.exam_type_code = category_ref.item_id
            AND category_ref.category_id = 29
            AND category_ref.item_desc2 = p_vehicle_category
            AND t.result_code = result_ref.item_id
            AND result_ref.item_desc2 IN ('F','U')    -- Failed or Unknown Test Result
            AND t.date_of_test > l_part1_date;
        RETURN l_count;
    END
//
  
/*
* Determines the entitlement check indicator for this booking.
*/
DROP FUNCTION IF EXISTS getEntitlementCheckIndicator
//
 
CREATE FUNCTION getEntitlementCheckIndicator(p_application_id INT) RETURNS INT
    BEGIN
        DECLARE l_count         INT;
        DECLARE TRUE_RESULT     INT DEFAULT 1;
        DECLARE FALSE_RESULT    INT DEFAULT 0;
 
        DECLARE c1 CURSOR FOR
            SELECT COUNT(*)
            FROM APPLICATION
            WHERE app_id = p_application_id
                AND state_code = 3;
 
        DECLARE c2 CURSOR FOR
            SELECT COUNT(*)
            FROM APPLICATION_HISTORY
            WHERE app_id = p_application_id
                AND event_code = 1030
                AND event_date_time >=
                    (
                    SELECT MAX(DATE(event_date_time))
                    FROM APPLICATION_HISTORY
                    WHERE app_id = p_application_id
                    AND event_code = 1020
                    );
           
        DECLARE c3 CURSOR FOR
            SELECT COUNT(app.app_id)
            FROM TEST_HISTORY theory, TEST_SERVICE ts, APPLICATION app, TEST_CATEGORY tc
            WHERE app.app_id = p_application_id
                AND ts.test_service_id = app.test_service_id
                AND ts.test_category_ref = tc.test_category_ref
                AND tc.theory_type_code = theory.theory_type_code
                AND theory.individual_id = app.individual_id
                AND theory.theory_pass_state_code IS NOT NULL
                AND theory.theory_pass_state_code > 1;
 
  
/*
* This logic is taken from the Journal reports and also outlined at a high level in the Journal requirements
* spec...
*
* The examiner should check the candidate's entitlement thoroughly if any of the following are true...
*/
 
/*
* 1. Is the application's state code is 3 (booked but unchecked)?
*/
        SET l_count = 0;
 
        OPEN c1;
        FETCH c1 INTO l_count;
        CLOSE c1;
 
        IF l_count > 0 THEN
        RETURN TRUE_RESULT;
        END IF;
         
/*
* 2. Did a booking supervisor override the entitlement check (event 1030) on or after booking made (event 1020)?
*/
        SET l_count = 0;
         
        OPEN c2;
        FETCH c2 INTO l_count;
        CLOSE c2;
         
        IF l_count > 0 THEN
        RETURN TRUE_RESULT;
        END IF;
        
/*
* 3. Is an associated (by test category) theory pass unchecked?
* (theory_pass_state_code: 1 = Checked, 2 = Not yet checked, 3 = Not found after check)
*/
        SET l_count = 0;
         
        OPEN c3;
        FETCH c3 INTO l_count;
        CLOSE c3;
 
        IF l_count > 0 THEN
        RETURN TRUE_RESULT;
        ELSE
        RETURN FALSE_RESULT;
        END IF;
    END
//
 
/*
* Determines the next available working day (after today) for the journal.
*/
DROP FUNCTION IF EXISTS getJournalEndDate;
//
 
CREATE FUNCTION getJournalEndDate(pCountryId INT, pStartDate DATE) RETURNS DATE
    BEGIN
        SET @Days           = (SELECT MAX(DAYS_IN_ADVANCE_COUNT) FROM AREA WHERE COUNTRY_ID = pCountryId);
        SET @ValidEndDay    = 0;
        SET @JournalEndDate = DATE_ADD(DATE(pStartDate), INTERVAL @Days-1 DAY);
         
            BEGIN
                WHILE @ValidEndDay < 1 DO
                    IF
                        (
                        SELECT DAYOFWEEK(@JournalEndDate)) BETWEEN 2 AND 6
                            AND NOT EXISTS (SELECT NON_WORKING_DATE FROM NON_WORKING_DAY WHERE STATUTORY_IND = 1 AND COUNTRY_ID = pCountryId AND NON_WORKING_DATE = @JournalEndDate
                        )
                    THEN
                        SET @ValidEndDay = 1;
                    ELSE
                        SET @JournalEndDate = DATE_ADD(DATE(@JournalEndDate), INTERVAL 1 DAY);                 
                    END IF;
                END WHILE;
                 
                RETURN @JournalEndDate;
            END;
 
    END;
//
 
  
DELIMITER ;