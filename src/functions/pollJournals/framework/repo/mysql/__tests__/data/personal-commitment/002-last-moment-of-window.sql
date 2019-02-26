INSERT INTO INDIVIDUAL (INDIVIDUAL_ID, DRIVER_NUMBER, TITLE_CODE, FAMILY_NAME, FIRST_FORENAME, SECOND_FORENAME, THIRD_FORENAME) VALUES (1, NULL, 2, 'fam', 'first', NULL, NULL);
INSERT INTO EXAMINER (STAFF_NUMBER, GRADE_CODE, INDIVIDUAL_ID) VALUES ('3', 'DE', 1);
INSERT INTO EXAMINER_STATUS (INDIVIDUAL_ID, START_DATE, END_DATE) VALUES (1, '1998-07-01 00:00:00', '4000-01-01');
INSERT INTO PROGRAMME (INDIVIDUAL_ID, PROGRAMME_DATE, TC_ID, STATE_CODE) VALUES(1, curdate(), 4, 5);
INSERT INTO PROGRAMME_SLOT (SLOT_ID, START_TIME, MINUTES, VST_CODE, NON_TEST_ACTIVITY_CODE, INDIVIDUAL_ID, PROGRAMME_DATE, TC_ID, DEPLOYED_TO_FROM_CODE, TC_CLOSED_IND)
  VALUES(6, now(), 57, 7, '081', 1, curdate(), 8, NULL, 0);
INSERT INTO NON_TEST_ACTIVITY_REASON (NON_TEST_ACTIVITY_CODE, REASON_DESC) VALUES ('081', 'Annual Leave');
INSERT INTO PERSONAL_COMMITMENT (COMMITMENT_ID, END_DATE_TIME, INDIVIDUAL_ID, NON_TEST_ACTIVITY_CODE, START_DATE_TIME)
  VALUES (9, '4000-12-31 23:59:00', 1, '081', date_add(date_add(curdate(), interval +14 day), interval -1 second));

