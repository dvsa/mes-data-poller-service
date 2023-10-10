create or replace view WORK_SCHEDULE_SLOTS as
select `ps`.`SLOT_ID`                        AS `slot_id`,
       cast(`p`.`PROGRAMME_DATE` as date)    AS `programme_date`,
       `ps`.`START_TIME`                     AS `start_time`,
       `ps`.`MINUTES`                        AS `minutes`,
       `ps`.`INDIVIDUAL_ID`                  AS `individual_id`,
       `ps`.`TC_ID`                          AS `tc_id`,
       `ps`.`VST_CODE`                       AS `vst_code`,
       `ps`.`NON_TEST_ACTIVITY_CODE`         AS `non_test_activity_code`,
       ifnull(`es`.`END_DATE`, '4000-01-01') AS `examiner_end_date`,
       `ps`.`DEPLOYED_TO_FROM_CODE`          AS `deployed_to_from_code`
from (((`tarsreplica`.`PROGRAMME` `p` join `tarsreplica`.`PROGRAMME_SLOT` `ps`
        on (((`ps`.`PROGRAMME_DATE` = `p`.`PROGRAMME_DATE`) and (`ps`.`INDIVIDUAL_ID` = `p`.`INDIVIDUAL_ID`) and
             (`ps`.`TC_ID` = `p`.`TC_ID`)))) join `tarsreplica`.`EXAMINER` `e`
       on ((`e`.`INDIVIDUAL_ID` = `p`.`INDIVIDUAL_ID`))) join `tarsreplica`.`EXAMINER_STATUS` `es`
      on ((`es`.`INDIVIDUAL_ID` = `e`.`INDIVIDUAL_ID`)))
where ((`ps`.`TC_CLOSED_IND` <> 1) and (ifnull(`ps`.`DEPLOYED_TO_FROM_CODE`, 0) <> 1) and
       (ifnull(`e`.`GRADE_CODE`, 'ZZZ') <> 'DELE') and ((`ps`.`NOT_BOOKABLE_IND` = 0) or (`ps`.`STATE_CODE` = 2)) and
       ((`p`.`STATE_CODE` not in (2, 3)) or exists(select `book`.`BOOKING_ID`
                                                   from (`tarsreplica`.`BOOKING` `book` join `tarsreplica`.`PROGRAMME_SLOT` `slot`
                                                         on ((`slot`.`SLOT_ID` = `book`.`SLOT_ID`)))
                                                   where ((`slot`.`PROGRAMME_DATE` = `p`.`PROGRAMME_DATE`) and
                                                          (`slot`.`INDIVIDUAL_ID` = `p`.`INDIVIDUAL_ID`) and
                                                          (`slot`.`TC_ID` = `p`.`TC_ID`) and
                                                          (`book`.`STATE_CODE` = 1)))));