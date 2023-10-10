create table if not exists tarsreplica.ADDRESS
(
    ADDRESS_ID        decimal(12)  not null
    primary key,
    ADDRESS_LINE_1    varchar(255) not null,
    ADDRESS_LINE_2    varchar(100) null,
    ADDRESS_LINE_3    varchar(100) null,
    ADDRESS_LINE_4    varchar(100) null,
    ADDRESS_LINE_5    varchar(255) null,
    POST_CODE         varchar(255) null,
    ADDRESS_TYPE_CODE decimal(12)  null,
    ORGANISATION_ID   decimal(12)  null,
    INDIVIDUAL_ID     decimal(12)  null,
    CREATED_BY        decimal(12)  not null
    );

create table if not exists tarsreplica.APPLICATION
(
    APP_ID                     decimal(12)  not null
    primary key,
    EXT_REQ_IND                tinyint      not null,
    MEETING_PLACE_REQ_TEXT     varchar(512) null,
    STATE_CODE                 int          not null,
    WELSH_TEST_IND             tinyint      not null,
    ORDER_ID                   int          not null,
    VEHICLE_ID                 int          null,
    INDIVIDUAL_ID              decimal(12)  null,
    TEST_SERVICE_ID            decimal(12)  null,
    SPECIAL_NEEDS_TEXT         varchar(512) null,
    CANCELLED_BOOKING_SEQ      tinyint      null,
    PROGRESSIVE_ACCESS         tinyint      not null,
    NOTIFICATION_EMAIL_ADDRESS varchar(100) null
    );

create table if not exists tarsreplica.APPLICATION_HISTORY
(
    APP_HISTORY_ID  int         not null
    primary key,
    APP_ID          decimal(12) not null,
    EVENT_CODE      int         not null,
    EVENT_DATE_TIME datetime    not null
    );

create table if not exists tarsreplica.APPLICATION_RSIS_INFO
(
    APP_ID      decimal(12) not null,
    BOOKING_SEQ tinyint     not null,
    CHECK_DIGIT tinyint     not null,
    BOOKING_ID  int         not null,
    primary key (APP_ID, BOOKING_SEQ)
    );

create table if not exists tarsreplica.APP_SYSTEM_PARAMETER
(
    APP_SYS_PARAM_KEY varchar(150) not null,
    DESCRIPTION       varchar(255) not null,
    VALUE             varchar(255) not null,
    EFFECTIVE_FROM    datetime     not null,
    EFFECTIVE_TO      datetime     null,
    primary key (APP_SYS_PARAM_KEY, EFFECTIVE_FROM)
    );

create table if not exists tarsreplica.AREA
(
    AREA_ID               decimal(12) not null
    primary key,
    DAYS_IN_ADVANCE_COUNT int         not null,
    COUNTRY_ID            int         null
    );

create table if not exists tarsreplica.BOOKING
(
    BOOKING_ID                 decimal(12) not null
    primary key,
    APP_ID                     decimal(12) not null,
    BOOKING_CANCEL_REASON_CODE int         null,
    STATE_CODE                 int         not null,
    SLOT_ID                    decimal(12) null,
    CREATED_ON                 datetime    not null
    );

create table if not exists tarsreplica.BOOKING_CANCELLATION_REASON
(
    BOOKING_CANCEL_REASON_CODE int         not null
    primary key,
    INITIATOR_CODE             varchar(15) not null,
    AUTO_NTA_CODE              varchar(4)  null
    );

create table if not exists tarsreplica.CHECK_TEST
(
    CHECK_TEST_ID                  decimal(12)  not null
    primary key,
    REGISTER_ID                    decimal(12)  null,
    ANNOTATION                     varchar(20)  null,
    BOOKING_CONFIRMED              tinyint      null,
    INVITATION_DATE                datetime     null,
    DATE_TEST                      datetime     null,
    TIME_TEST                      varchar(255) null,
    ELEMENTS_OF_TRAINING_INSPECTED varchar(4)   null,
    CANNOT_ATTEND                  tinyint      null,
    SE_ID                          int          null,
    UNABLE_TO_CONTACT              tinyint      null,
    OTHER_ACTION_TAKEN             varchar(250) null,
    REPLACEMENT_BOOKING_DATE       datetime     null,
    REASON_FOR_NON_REPLACEMENT     varchar(485) null,
    RESULT                         decimal(12)  null,
    CREATED_BY                     decimal(12)  not null,
    CREATED_ON                     datetime     not null,
    UPDATED_BY                     decimal(12)  not null,
    UPDATED_ON                     datetime     not null,
    CHECK_TEST_DATE                datetime     null,
    PAYMENT_DATE                   datetime     null,
    OFF_ROAD                       tinyint      null,
    ON_ROAD                        tinyint      null,
    TEST_CATEGORY_ID               decimal(12)  null
    );

create index CHECK_TEST_REG_ID_IDX
    on tarsreplica.CHECK_TEST (REGISTER_ID);

create table if not exists tarsreplica.COMMITMENT_AFFECTED_SLOT
(
    COMMITMENT_ID           decimal(12) not null,
    SLOT_ID                 decimal(12) not null,
    MODIFICATION_SEQ_NUMBER decimal(12) null,
    primary key (COMMITMENT_ID, SLOT_ID)
    );

create table if not exists tarsreplica.CONTACT_DETAILS
(
    CONTACT_DETAILS_ID       decimal(12)    not null
    primary key,
    ORGANISATION_REGISTER_ID decimal(20, 2) null,
    INDIVIDUAL_ID            decimal(12)    null,
    PRIMARY_TEL_NUMBER       varchar(20)    null,
    SECONDARY_TEL_NUMBER     varchar(20)    null,
    EMAIL_ADDRESS            varchar(100)   null,
    MOBILE_TEL_NUMBER        varchar(30)    null,
    PRIM_TEL_VOICEMAIL_IND   tinyint        null,
    SEC_TEL_VOICEMAIL_IND    tinyint        null,
    MOBILE_VOICEMAIL_IND     tinyint        null
    );

create table if not exists tarsreplica.CUSTOMER_ORDER
(
    ORDER_ID               int         not null
    primary key,
    BUSINESS_ID            decimal(12) null,
    BOOKER_TYPE_CODE       varchar(1)  not null,
    DELEGATED_AUTHORITY_ID decimal(12) null
    );

create table if not exists tarsreplica.DEPLOYMENT
(
    DEPLOYMENT_ID decimal(12) not null,
    START_DATE    datetime    not null,
    END_DATE      datetime    not null,
    TC_ID         decimal(12) not null,
    INDIVIDUAL_ID decimal(12) null,
    constraint DEPLOYMENT_DE_DEPLOYMENT_ID_PK
    unique (DEPLOYMENT_ID)
    );

create table if not exists tarsreplica.DES_TEST_CRITERIA
(
    EXAMINER_STAFF_NUMBER varchar(10) null,
    TEST_CATEGORY_REF     varchar(10) not null,
    WITH_EFFECT_FROM      datetime    not null,
    WITH_EFFECT_TO        datetime    null
    );

create table if not exists tarsreplica.DRIVER_LICENCE_CATEGORY
(
    CURRENT_DRIVER_NUMBER  varchar(16) not null,
    TEST_CATEGORY_REF      varchar(10) not null,
    ENTITLEMENT_START_DATE datetime    null,
    ENTITLEMENT_TYPE_CODE  varchar(1)  not null
    );

create table if not exists tarsreplica.ETHNIC_ORIGIN
(
    DRIVER_NUMBER  varchar(16) null,
    ETHNICITY_CODE varchar(1)  null,
    LOADED_DATE    datetime    null
    );

create index IX_ETHNORGN_COV
    on tarsreplica.ETHNIC_ORIGIN (DRIVER_NUMBER, LOADED_DATE);

create table if not exists tarsreplica.EXAMINER
(
    STAFF_NUMBER  varchar(10) not null,
    GRADE_CODE    varchar(4)  null,
    INDIVIDUAL_ID decimal(12) not null
    primary key
    );

create table if not exists tarsreplica.EXAMINER_GRADE
(
    EXAMINER_GRADE_CODE     varchar(4) not null
    primary key,
    TEST_CENTRE_MANAGER_IND tinyint    null
    );

create table if not exists tarsreplica.EXAMINER_STATUS
(
    INDIVIDUAL_ID decimal(12) not null,
    START_DATE    datetime    not null,
    END_DATE      datetime    null,
    primary key (INDIVIDUAL_ID, START_DATE)
    );

create table if not exists tarsreplica.INDIVIDUAL
(
    INDIVIDUAL_ID   decimal(12) not null
    primary key,
    DRIVER_NUMBER   varchar(24) null,
    DATE_OF_BIRTH   datetime    null,
    TITLE_CODE      decimal(12) null,
    FAMILY_NAME     varchar(50) null,
    FIRST_FORENAME  varchar(50) null,
    SECOND_FORENAME varchar(50) null,
    THIRD_FORENAME  varchar(50) null,
    GENDER_CODE     decimal(12) null
    );

create table if not exists tarsreplica.INTEGRITY_DETAILS
(
    INTEGRITY_ID          int         not null
    primary key,
    INDIVIDUAL_ID         decimal(12) not null,
    INTEGRITY_CASE_NUMBER varchar(50) null,
    INTEGRITY_IND         tinyint     null,
    ENTRY_DATE_TIME       datetime    null
    );

create table if not exists tarsreplica.NON_TEST_ACTIVITY_REASON
(
    NON_TEST_ACTIVITY_CODE varchar(4)  not null
    primary key,
    REASON_DESC            varchar(50) not null
    );

create table if not exists tarsreplica.NON_WORKING_DAY
(
    COUNTRY_ID       int      not null,
    NON_WORKING_DATE datetime not null,
    STATUTORY_IND    tinyint  not null,
    primary key (COUNTRY_ID, NON_WORKING_DATE)
    );

create table if not exists tarsreplica.ORGANISATION
(
    ORGANISATION_ID   decimal(12)  not null
    primary key,
    ORGANISATION_NAME varchar(100) null
    );

create table if not exists tarsreplica.ORGANISATION_REGISTER
(
    ORGANISATION_REGISTER_ID decimal(12) not null
    primary key,
    ORGANISATION_ID          decimal(12) null,
    REGISTER_CODE            decimal(12) null,
    BUSINESS_ID              decimal(12) null,
    BRN                      decimal(12) null
    );

create table if not exists tarsreplica.PERSONAL_COMMITMENT
(
    COMMITMENT_ID          decimal(12) not null,
    END_DATE_TIME          datetime    not null,
    INDIVIDUAL_ID          decimal(12) not null,
    NON_TEST_ACTIVITY_CODE varchar(4)  not null,
    START_DATE_TIME        datetime    not null,
    constraint PERSONAL_COMMITMENT_PC_COMMITMENT_ID_PK
    unique (COMMITMENT_ID)
    );

create table if not exists tarsreplica.PROGRAMME
(
    INDIVIDUAL_ID  decimal(12) not null,
    PROGRAMME_DATE datetime    not null,
    TC_ID          decimal(12) not null,
    STATE_CODE     int         not null,
    primary key (INDIVIDUAL_ID, PROGRAMME_DATE, TC_ID)
    );

create index IX_P_PROGDATE
    on tarsreplica.PROGRAMME (PROGRAMME_DATE);

create table if not exists tarsreplica.PROGRAMME_SLOT
(
    SLOT_ID                bigint     not null
    primary key,
    START_TIME             datetime   not null,
    MINUTES                smallint   not null,
    VST_CODE               bigint     null,
    NON_TEST_ACTIVITY_CODE varchar(4) null,
    INDIVIDUAL_ID          bigint     not null,
    PROGRAMME_DATE         datetime   not null,
    TC_ID                  bigint     not null,
    DEPLOYED_TO_FROM_CODE  tinyint    null,
    TC_CLOSED_IND          tinyint    not null,
    STATE_CODE             int        null,
    NOT_BOOKABLE_IND       tinyint    null,
    GHOST_IND              tinyint    null
    );

create index IX_PS_COV
    on tarsreplica.PROGRAMME_SLOT (PROGRAMME_DATE, INDIVIDUAL_ID, TC_ID, TC_CLOSED_IND);

create table if not exists tarsreplica.REF_DATA_ITEM_MASTER
(
    ITEM_ID     decimal(12)  not null,
    ITEM_DESC1  varchar(255) null,
    ITEM_DESC2  varchar(255) null,
    CATEGORY_ID decimal(12)  not null,
    primary key (CATEGORY_ID, ITEM_ID)
    );

create table if not exists tarsreplica.REGISTER
(
    REGISTER_ID          decimal(12) not null
    primary key,
    INDIVIDUAL_ID        decimal(12) null,
    ORGANISATION_ID      decimal(12) null,
    REGISTER_CODE        decimal(12) null,
    PRN                  decimal(12) null,
    LAST_CHECK_TEST_DATE datetime    null,
    VEHICLE_TYPE_CODE    varchar(12) null,
    DATE_LAST_APPROVED   datetime    null
    );

create index REGISTER_ORGANISATION_ID_IDX
    on tarsreplica.REGISTER (ORGANISATION_ID);

create index REGISTER_REGISTER_CODE_IDX
    on tarsreplica.REGISTER (REGISTER_CODE);

create table if not exists tarsreplica.SUPERVISING_EXAMINERS
(
    SE_ID          decimal(12)  not null
    primary key,
    SE_NAME        varchar(100) null,
    AREA_ID        int          null,
    SECTOR_ID      decimal(12)  null,
    TEST_CENTRE_ID decimal(12)  null,
    CREATED_BY     decimal(12)  not null,
    CREATED_ON     datetime     not null,
    UPDATED_BY     decimal(12)  not null,
    UPDATED_ON     datetime     not null,
    COUNTY_CODE    varchar(50)  null,
    STAFF_NUMBER   decimal(12)  null,
    GRADE_CODE     varchar(100) null,
    TITLE          varchar(100) null,
    FORENAMES      varchar(200) null,
    SURNAME        varchar(200) null,
    ADI_SE_NUMBER  int          null,
    FIRST_NAME     varchar(200) null,
    COUNTRY_CODE   int          null
    );

create table if not exists tarsreplica.TEST_CATEGORY
(
    TEST_CATEGORY_REF varchar(10) not null
    primary key,
    THEORY_TYPE_CODE  int         not null,
    TB_CATEGORY       tinyint     not null
    );

create table if not exists tarsreplica.TEST_CENTRE
(
    TC_ID               decimal(12) not null
    primary key,
    TC_COST_CENTRE_CODE varchar(6)  not null,
    COMMISSION_DATE     datetime    not null,
    DECOMMISSION_DATE   datetime    null,
    COUNTRY_ID          int         not null
    );

create table if not exists tarsreplica.TEST_CENTRE_NAME
(
    TC_ID   decimal(12) not null
    primary key,
    TC_NAME varchar(50) not null
    );

create table if not exists tarsreplica.TEST_HISTORY
(
    HISTORY_ID                  decimal(12) not null
    primary key,
    INDIVIDUAL_ID               decimal(12) null,
    REGISTER_ID                 decimal(12) null,
    APPLICATION_ID              decimal(12) null,
    EXAM_TYPE_CODE              decimal(12) null,
    DATE_OF_TEST                datetime    null,
    RESULT_CODE                 decimal(12) null,
    UPDATED_ON                  datetime    not null,
    MARK                        decimal     null,
    THEORY_PASS_STATE_CODE      tinyint     null,
    THEORY_TYPE_CODE            int         null,
    GRADE_ID                    smallint    null,
    BOOKING_ID                  decimal(12) null,
    ORIGINAL_CERTIFICATE_NUMBER decimal(15) null
    );

create table if not exists tarsreplica.TEST_RESULT_GRADE
(
    GRADE_ID         smallint    not null,
    START_MARK_RANGE smallint    not null,
    END_MARK_RANGE   smallint    not null,
    MAX_RESULT       smallint    not null,
    RESULT_CODE      int         not null,
    GRADE_DESC       varchar(20) not null,
    CREATED_DATE     datetime    not null
    );

create table if not exists tarsreplica.TEST_SERVICE
(
    TEST_SERVICE_ID    decimal(12) not null
    primary key,
    EXTENDED_IND       tinyint     not null,
    SPECIAL_NEEDS_CODE varchar(20) not null,
    TEST_CATEGORY_REF  varchar(10) not null,
    VST_CODE           int         not null
    );

create table if not exists tarsreplica.VEHICLE
(
    VEHICLE_ID           int           not null
    primary key,
    CAB_SEAT_COUNT       smallint      null,
    GEARBOX_CODE         tinyint       null,
    HEIGHT_M             decimal(5, 2) null,
    LENGTH_M             decimal(5, 2) null,
    WIDTH_M              decimal(5, 2) null,
    PASSENGER_SEAT_COUNT tinyint       null
    );

create table if not exists tarsreplica.VEHICLE_SLOT_TYPE
(
    VST_CODE          decimal(12) not null
    primary key,
    VEHICLE_TYPE_CODE varchar(2)  not null
    );
