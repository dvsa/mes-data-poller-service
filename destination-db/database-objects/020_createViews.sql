USE tarsreplica;
CREATE OR REPLACE VIEW WORK_SCHEDULE_SLOTS AS
SELECT ps.slot_id, DATE(p.programme_date) as programme_date, ps.start_time, ps.minutes,
    ps.individual_id, ps.tc_id, ps.vst_code, ps.non_test_activity_code,
    IFNULL(es.end_date, '4000-01-01') as examiner_end_date, ps.deployed_to_from_code
FROM PROGRAMME p
JOIN PROGRAMME_SLOT ps
    ON ps.programme_date = p.programme_date
    AND ps.individual_id = p.individual_id
    AND ps.tc_id = p.tc_id
JOIN EXAMINER e on e.individual_id = p.individual_id
JOIN EXAMINER_STATUS es on es.individual_id = e.individual_id
WHERE ps.tc_closed_ind != 1
AND IFNULL(ps.deployed_to_from_code, 0) != 1
AND IFNULL(e.grade_code, 'ZZZ') != 'DELE'
AND (ps.not_bookable_ind = 0 or ps.state_code = 2)
AND (
    p.state_code NOT IN (2, 3)
    OR EXISTS
        (
        SELECT book.booking_id
        FROM BOOKING book
        JOIN PROGRAMME_SLOT slot on slot.slot_id = book.slot_id
        WHERE slot.programme_date = p.programme_date
        AND slot.individual_id = p.individual_id
        AND slot.tc_id = p.tc_id
        AND book.state_code = 1
        )
    );
