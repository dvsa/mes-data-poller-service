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

DROP FUNCTION IF EXISTS getBusLorryDVLAConfIndicator;
//

CREATE FUNCTION getBusLorryDVLAConfIndicator(p_candidate_id INT, p_test_category_code VARCHAR(30)) RETURNS INT
    BEGIN
        DECLARE l_effective_date DATE DEFAULT NULL;
        DECLARE l_count INT DEFAULT 0;
        DECLARE l_test_category_code VARCHAR(10) DEFAULT p_test_category_code;

        DECLARE voc_mano_eff_date_curr CURSOR for
            SELECT str_to_date(value, '%d/%m/%Y')
            FROM app_system_parameter
            WHERE app_sys_param_key = 'LORRY_BUS_MAN_ACTIVE_DATE'
            AND SYSDATE() BETWEEN effective_from AND IFNULL(effective_to, DATE_ADD(SYSDATE(), INTERVAL 1 DAY)); 

        -- The Test Category we want to use for checking (D90 Data has no M or + in its data
        SET l_test_category_code = REPLACE(REPLACE(p_test_category_code, 'M', ''), '+', '');    

        -- Only the following categories are supported for the check
        IF l_test_category_code NOT IN ('C','CE','C1','C1E','D','DE','D1','D1E') THEN
          RETURN 0;
        END IF; 

        -- Get the effectivity parameter
        -- Open the cursor and load the latest updated record
        OPEN voc_mano_eff_date_curr;
        FETCH voc_mano_eff_date_curr INTO l_effective_date;
        CLOSE voc_mano_eff_date_curr;

        -- if the date is not in effective yet then we don't indicate a check is required
        IF (l_effective_date IS NULL OR SYSDATE() < l_effective_date) THEN
            RETURN 0;
        END IF;

         -- Check the Licence data for the Driver to ensure they have the entitlements
        SELECT COUNT(*) INTO l_count
        FROM licence_category lic_cat
                 JOIN INDIVIDUAL IND
                      ON lic_cat.current_driver_number = ind.driver_number
        WHERE ind.individual_id = p_candidate_id
            AND (
                (lic_cat.test_category_ref = l_test_category_code AND lic_cat.entitlement_type_code = 'P')
                OR (
                        (lic_cat.test_category_ref LIKE 'C%' OR test_category_ref LIKE 'D%')
                        AND lic_cat.entitlement_type_code = 'F'
                        AND l_test_category_code LIKE 'C%'
                   )
                OR (
                        lic_cat.test_category_ref LIKE 'D%'
                        AND entitlement_type_code = 'F'
                        AND l_test_category_code LIKE 'D%'
                   )
                OR (
                        (lic_cat.test_category_ref LIKE 'C%' OR test_category_ref LIKE 'D%')
                        AND lic_cat.entitlement_type_code = 'P' 
                        AND lic_cat.entitlement_start_date >= l_effective_date
                        AND l_test_category_code LIKE 'C%'
                   )
                OR (
                        (lic_cat.test_category_ref LIKE 'D%')
                        AND lic_cat.entitlement_type_code = 'P' 
                        AND lic_cat.entitlement_start_date >= l_effective_date
                        AND l_test_category_code LIKE 'D%'
                   )
             );

        -- Check the count, of there are records found then the Examiner does not need to ask the candidate to produce the evidence.
        IF l_count > 0 THEN
            RETURN 0;
        ELSE
            RETURN 1;
        END IF;

    END;
//

DELIMITER ;
