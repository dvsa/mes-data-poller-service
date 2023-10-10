USE tarsreplica;

-- CREATE USER IF NOT EXISTS 'poller' IDENTIFIED WITH AWSAuthenticationPlugin as 'RDS';
-- GRANT SELECT, EXECUTE ON tarsreplica.* TO 'poller';

CREATE USER IF NOT EXISTS 'dms_user' IDENTIFIED WITH caching_sha2_password BY '<USER_PASSWORD>' PASSWORD EXPIRE NEVER;
GRANT ALL ON tarsreplica.* TO 'dms_user';
GRANT ALL ON awsdms_control.* TO 'dms_user';

CREATE USER IF NOT EXISTS 'refdata' IDENTIFIED WITH caching_sha2_password BY '<USER_PASSWORD>' PASSWORD EXPIRE NEVER;
GRANT SELECT ON tarsreplica.TEST_CENTRE TO 'refdata';
GRANT SELECT ON tarsreplica.TEST_CENTRE_NAME TO 'refdata';
