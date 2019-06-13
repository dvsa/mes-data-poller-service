-- First, create the stored procedure
DROP PROCEDURE IF EXISTS tarsreplica.CreateIndex;

DELIMITER //

CREATE PROCEDURE tarsreplica.CreateIndex
(
    schemaName	VARCHAR(64),
    tableName   VARCHAR(64),
    indexName   VARCHAR(64),
    columnNames VARCHAR(64)
)
BEGIN

    DECLARE IndexIsThere INT;

    SELECT COUNT(1) INTO IndexIsThere
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE table_schema = schemaName
    AND table_name = tableName
    AND index_name = indexName;

    IF IndexIsThere = 0 THEN
        SET @sqlstmt = CONCAT('CREATE INDEX ',indexName,' ON ', schemaName,'.',tableName,' (',columnNames,')');
        PREPARE st FROM @sqlstmt;
        EXECUTE st;
        DEALLOCATE PREPARE st;
    ELSE
        SELECT CONCAT('Index ',indexName,' already exists on Table ', schemaName,'.',tableName) CreateIndexErrorMessage;   
    END IF;

END //

DELIMITER ;

-- Then create the indexes
CALL CreateIndex ('tarsreplica','REF_DATA_ITEM_MASTER','IX_RDIM_ITEMID','item_id');
CALL CreateIndex ('tarsreplica','BOOKING','IX_B_APPID','app_id');
CALL CreateIndex ('tarsreplica','BOOKING','IX_B_CANREASON','booking_cancel_reason_code');
CALL CreateIndex ('tarsreplica','BOOKING','IX_B_SLOTID','slot_id');
CALL CreateIndex ('tarsreplica','BOOKING','IX_B_STATECODE','state_code');
CALL CreateIndex ('tarsreplica','PROGRAMME','IX_P_PROGDATE','programme_date');
CALL CreateIndex ('tarsreplica','PROGRAMME_SLOT','IX_PS_COV','programme_date,individual_id,tc_id,tc_closed_ind');
CALL CreateIndex ('tarsreplica','ADDRESS','IX_ADDR_INDID','individual_id');
CALL CreateIndex ('tarsreplica','ADDRESS','IX_ADDR_ORGID','organisation_id');
CALL CreateIndex ('tarsreplica','ADDRESS','IX_ADDR_TYPE','address_type_code');
CALL CreateIndex ('tarsreplica','CONTACT_DETAILS','IX_CD_INDID','individual_id');
CALL CreateIndex ('tarsreplica','CONTACT_DETAILS','IX_CD_ORGREG','organisation_register_id');
CALL CreateIndex ('tarsreplica','CUSTOMER_ORDER','IX_CO_BUSINESS_ID','business_id');
CALL CreateIndex ('tarsreplica','ORGANISATION_REGISTER','IX_OR_ORGID','organisation_id');
CALL CreateIndex ('tarsreplica','ORGANISATION_REGISTER','IX_ORGREG_COV','business_id,organisation_register_id');
CALL CreateIndex ('tarsreplica','REGISTER','IX_REG_INDID','individual_id');
CALL CreateIndex ('tarsreplica','TEST_HISTORY','IX_TH_INDID','individual_id');
CALL CreateIndex ('tarsreplica','APPLICATION_HISTORY','IX_AH_APP_ID','app_id');
CALL CreateIndex ('tarsreplica','APPLICATION_RSIS_INFO','IX_RSIS_BOOKID','booking_id');