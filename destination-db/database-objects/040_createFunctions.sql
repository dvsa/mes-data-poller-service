USE tarsreplica;
DELIMITER //
//

DROP FUNCTION IF EXISTS getPreviousADIAttempts
//

/*
   * Determines the previous test attempt number for a Given Instructor.
   * We have the naming convention used from DES with this method name.
   * p_candidate_id        the Candidate Individual Id.
   * p_test_category_code  the Test Category Code for the Test Category being booked.
   * p_app_id              the Application Id of the application being booked.
*/
CREATE FUNCTION getPreviousADIAttempts(p_candidate_id INT, p_test_category_code VARCHAR(30), p_app_id INT) RETURNS INT
BEGIN
    return getInstructorTestAttemptNumber(p_candidate_id, p_test_category_code, p_app_id);
END;
//

DROP FUNCTION IF EXISTS getInstructorTestAttemptNumber
//

/*
 * Determines the test attempt number for a Given Instructor.
 * p_candidate_id        the Candidate Individual Id.
 * p_test_category_code  the Test Category Code for the Test Category being booked.
 * p_app_id              the Application Id of the application being booked.
 */
CREATE FUNCTION getInstructorTestAttemptNumber(p_candidate_id INT, p_test_category_code VARCHAR(30), p_app_id INT) RETURNS INT
BEGIN
    IF 'SC' = p_test_category_code THEN
        RETURN getSCTestAttemptNumber(p_candidate_id, p_app_id);
    ELSE
        RETURN getADITestAttemptNumber(p_candidate_id, p_test_category_code, p_app_id);
    END IF;
END;
//

DROP FUNCTION IF EXISTS getADITestAttemptNumber
//

/*
 * Determines the ADI test attempt number of the instructor.
 * p_candidate_id         the Candidate Individual Id.
 * p_test_category_code   the Test Category Code for the Test Category being booked.
 * p_app_id               the Application Id of the application being booked.
 */
CREATE FUNCTION getADITestAttemptNumber(p_candidate_id INT, p_test_category_code VARCHAR(30), p_app_id INT) RETURNS INT
BEGIN
    DECLARE l_count INT;

      -- Test has to be after the latest Part 1 pass which is after the approval date
      --     or approval date of the register in the absence of the Part 1.
      --     or forever if there is no last approval date (which should never happen)
      -- Looking for records that are
      --  - for the test being taken.
      --  - of failed result or Unknown result (provided the unknown result is not for the same application)
      --  - related to the ADI Register as the instructor may have results on other registers
    SELECT count(*) INTO l_count
    FROM TEST_HISTORY th
             JOIN REGISTER reg ON reg.register_id = th.register_id
                                      AND reg.individual_id = th.individual_id
    WHERE th.date_of_test >= COALESCE(
        (
        SELECT MAX(t.date_of_test) date_of_test
        FROM REGISTER r
        LEFT JOIN TEST_HISTORY t ON r.individual_id = t.individual_id
                   AND t.register_id = r.register_id
                   AND t.date_of_test >= r.date_last_approved
                   AND t.exam_type_code = 2097  -- ADI Part 1
                   AND t.result_code = 2037     -- Success Result
                   AND r.register_code = 195
                   WHERE r.individual_id = th.individual_id
        ),
           reg.date_last_approved
        )
      AND th.exam_type_code = (SELECT cat_ref.item_id
                               FROM REF_DATA_ITEM_MASTER cat_ref
                               WHERE cat_ref.category_id = 29
                                 AND cat_ref.item_desc2 = p_test_category_code)
      AND (
            (result_code = 5020 AND COALESCE(th.application_id, -2) != COALESCE(p_app_id, -1)) -- if unknown and is for the current application then it should be ignored
            OR
            th.result_code = 2036 -- Failed
        )
      AND th.individual_id = p_candidate_id
      AND reg.register_code = 195;  -- ADI Register

    RETURN l_count;
END;
//

DROP FUNCTION IF EXISTS getSCTestAttemptNumber
//

/*
  * Determines the Standards Check test attempt number of the instructor.
  * Please see TestResultsConstants class in TARS for available Result Ids.
  * p_candidate_id         the Candidate Individual Id.
  * p_app_id               the Application Id of the application being booked.
  */
CREATE function getSCTestAttemptNumber(p_candidate_id INT, p_app_id INT) RETURNS INT
BEGIN
    DECLARE l_count INT;
    -- Test has to be after the latest Standards check pass which is on or after the last approval date
    --     or the approval date of the register in the absence of the Pass result.
    --     or forever if there is no last approval date (which should never happen)
    -- Looking for records that are
    --  - for the test being taken.
    --  - of failed result or Unknown result (provided the unknown result is not for the same application)
    --  - related to the ADI Register as the examiner may have results on other registers
    -- Checking for Results that are recorded either in the TARS bookings or via IRDT.
    --    Status codes of 2036 to 5020 are for Results from tests that are booked through TARS
    --    Status codes of 767 to 776 and 10132 to 10181 are for Results from tests that are recorded through IRDT (Check_Test).
    SELECT COUNT(*)
    INTO l_count
    FROM (SELECT IF(th.date_test IS NULL, NULL,
                    CONCAT(DATE_FORMAT(date_test, '%Y-%m-%d'), ' ', TIME_FORMAT(th.time_test, '%H:%i:%s')))
                                            AS date_time_test,
                 th.register_id,
                 r.individual_id,
                 COALESCE(th.result, 5020) AS result,
                 NULL                      AS application_id
          FROM CHECK_TEST th
                   JOIN REGISTER r ON r.register_id = th.register_id
          WHERE r.individual_id = p_candidate_id
          UNION ALL
          SELECT th.date_of_test   AS date_time_test,
                 th.register_id,
                 th.individual_id,
                 th.result_code    AS result,
                 th.application_id AS application_id
          FROM TEST_HISTORY th
                   JOIN REGISTER r ON r.register_id = th.register_id AND th.individual_id = r.individual_id
          WHERE th.individual_id = p_candidate_id
            AND th.exam_type_code = 5049) th
             JOIN REGISTER r on r.register_id = th.register_id
    WHERE th.individual_id = p_candidate_id
      AND r.register_code = 195 -- ADI Register
      AND th.date_time_test >= COALESCE(
            (SELECT MAX(t.date_time_test) date_of_test
             FROM (SELECT IF(date_test IS NULL, NULL,
                             STR_TO_DATE(
                                     CONCAT(DATE_FORMAT(date_test, '%Y-%m-%d'), ' ', TIME_FORMAT(time_test, '%H:%i:%s')),
                                     '%d/%m/%Y %H:%i')
                              )                   AS date_time_test,
                          th.register_id,
                          r.individual_id,
                          IFNULL(th.result, 5020) AS result,
                          NULL                    AS application_id
                   FROM CHECK_TEST th
                            JOIN REGISTER r ON r.register_id = th.register_id
                   WHERE r.individual_id = p_candidate_id
                   UNION ALL
                   SELECT th.date_of_test   AS date_time_test,
                          th.register_id,
                          th.individual_id,
                          th.result_code    AS result,
                          th.application_id AS application_id
                   FROM TEST_HISTORY th
                            JOIN REGISTER r ON r.register_id = th.register_id AND th.individual_id = r.individual_id
                   WHERE th.individual_id = p_candidate_id
                     AND th.exam_type_code = 5049) t
             WHERE r.individual_id = t.individual_id
               AND t.register_id = r.register_id
               AND t.date_time_test >= COALESCE(r.date_last_approved, t.date_time_test)
               AND result IN (2037 -- Pass
                 , 767 -- 6
                 , 768 -- 5
                 , 769 -- 4
                 , 10132 -- A 51/51
                 , 10133 -- A 50/51
                 , 10134 -- A 49/51
                 , 10135 -- A 48/51
                 , 10136 -- A 47/51
                 , 10137 -- A 46/51
                 , 10138 -- A 45/51
                 , 10139 -- A 44/51
                 , 10140 -- A 43/51
                 , 10150 -- B 42/51
                 , 10151 -- B 41/51
                 , 10152 -- B 40/51
                 , 10153 -- B 39/51
                 , 10154 -- B 38/51
                 , 10155 -- B 37/51
                 , 10170 -- B 36/51
                 , 10171 -- B 35/51
                 , 10172 -- B 34/51
                 , 10173 -- B 33/51
                 , 10174 -- B 32/51
                 , 10175) -- B 31/51
            ), r.date_last_approved
        )
      AND (
            (result = 5020 AND IFNULL(th.application_id, -2) != IFNULL(p_app_id, -1)) -- if unknown and is for the current application then it should be ignored
            OR
            result IN (2036 -- Failed
                , 2300 -- Failed 1
                , 2301 -- Failed 2
                , 2302 -- Failed 3
                , 2303 -- Failed Automatic 1
                , 2304 -- Failed Automatic 2
                , 2305 -- Failed Automatic 3
                , 2308 -- Dangerous
                , 770 -- 3/3
                , 771 -- 3/2
                , 772 -- 3/1
                , 773 -- 2/3
                , 774 -- 2/2
                , 775 -- 2/1
                , 776 -- 1
                , 10176 -- Fail 1
                , 10177 -- Fail 2
                , 10178 -- Fail 3
                , 10179 -- Fail Automatic 1
                , 10180 -- Fail Automatic 2
                , 10181 -- Fail Automatic 3
                , 10190 -- Dangerous
                , 9850) -- No Result
        );
    return l_count;
END;
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
        DECLARE l_driver_number VARCHAR(4000) DEFAULT NULL;
        DECLARE gb_driver_number_curr_p_individual_id INT;
        DECLARE h_no_rows_left INT DEFAULT 0;
        DECLARE v_no_rows_left INT DEFAULT 0;

        DECLARE voc_mano_eff_date_curr CURSOR for
            SELECT str_to_date(value, '%d/%m/%Y')
            FROM APP_SYSTEM_PARAMETER
            WHERE app_sys_param_key = 'LORRY_BUS_MAN_ACTIVE_DATE'
              AND SYSDATE() BETWEEN effective_from AND IFNULL(effective_to, DATE_ADD(SYSDATE(), INTERVAL 1 DAY));

        -- Assumed Driver Number must be 16 digits (CLH is always 16 digits)
        DECLARE gb_driver_number_curr CURSOR for
            SELECT DISTINCT(TRIM(driver_number))
            FROM INDIVIDUAL
            WHERE CHAR_LENGTH(TRIM(driver_number)) = 16
              AND individual_id = gb_driver_number_curr_p_individual_id;

        -- The Test Category we want to use for checking (D90 Data has no M or + in its data
        SET l_test_category_code = REPLACE(REPLACE(p_test_category_code, 'M', ''), '+', '');

        -- Only the following categories are supported for the check
        IF l_test_category_code NOT IN ('C', 'CE', 'C1', 'C1E', 'D', 'DE', 'D1', 'D1E') THEN
            RETURN 0;
        END IF;

        -- Get the effectivity parameter
        -- Open the cursor and load the latest updated record
        OPEN voc_mano_eff_date_curr;
            BEGIN
                DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_no_rows_left = 1;
                FETCH voc_mano_eff_date_curr INTO l_effective_date;
            END;
        CLOSE voc_mano_eff_date_curr;

        IF (v_no_rows_left = 1) THEN
            RETURN 0;
        END IF;

        -- if the date is not in effective yet then we don't indicate a check is required
        IF (l_effective_date IS NULL OR SYSDATE() < l_effective_date) THEN
            RETURN 0;
        END IF;

        -- Get the Driver Number when GB or CLH length
        -- Trust TARS has the data correct and only allows GB, NI or CLH to be booked.
        -- Open the cursor and load the driver number
        SET gb_driver_number_curr_p_individual_id = p_candidate_id;

        OPEN gb_driver_number_curr;
            BEGIN
                DECLARE CONTINUE HANDLER FOR NOT FOUND SET h_no_rows_left = 1;
                FETCH gb_driver_number_curr INTO l_driver_number;
            END;
        CLOSE gb_driver_number_curr;

        IF (h_no_rows_left = 1) THEN
            RETURN 0;
        END IF;

        -- If the GB or CLH driver number cannot be found then we dont want a marker.
        IF l_driver_number IS NULL THEN
            RETURN 0;
        -- CLH driver numbers always require a marker.
        ELSEIF UPPER(l_driver_number) LIKE '%CLH' THEN
            RETURN 1;
        END IF;

         -- Check the Licence data for the Driver to ensure they have the entitlements
        SELECT COUNT(*) INTO l_count
        FROM DRIVER_LICENCE_CATEGORY lic_cat
        WHERE lic_cat.current_driver_number = l_driver_number
          AND ((lic_cat.entitlement_type_code = 'P'
            AND ((lic_cat.test_category_ref = l_test_category_code)
                OR (lic_cat.test_category_ref IN ('C', 'C1E', 'CE') AND l_test_category_code IN ('C1'))
                OR (lic_cat.test_category_ref IN ('CE') AND l_test_category_code IN ('C1E', 'C'))
                OR (lic_cat.test_category_ref IN ('D', 'D1E', 'DE') AND l_test_category_code IN ('D1'))
                OR (lic_cat.test_category_ref IN ('DE') AND l_test_category_code IN ('D1E', 'D'))))
            OR (lic_cat.entitlement_type_code = 'F'
                AND (((lic_cat.test_category_ref LIKE 'C%' AND lic_cat.test_category_ref != 'C1') AND l_test_category_code LIKE 'C%')
                    OR (lic_cat.test_category_ref = 'C1' AND l_test_category_code = 'C1')
                    OR (lic_cat.test_category_ref LIKE 'D%' AND (l_test_category_code LIKE 'C%' OR l_test_category_code LIKE 'D%'))))
            OR ((lic_cat.entitlement_type_code = 'P' AND lic_cat.entitlement_start_date >= l_effective_date)
                AND ((lic_cat.test_category_ref like 'C%' AND lic_cat.test_category_ref != 'C1' AND l_test_category_code LIKE 'C%')
                    OR (lic_cat.test_category_ref = 'C1' AND l_test_category_code = 'C1')
                    OR lic_cat.test_category_ref LIKE 'D%'))
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
