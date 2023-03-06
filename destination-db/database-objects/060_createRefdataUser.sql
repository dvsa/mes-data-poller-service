USE tarsreplica;
CREATE USER IF NOT EXISTS 'refdata' IDENTIFIED WITH AWSAuthenticationPlugin as 'RDS';
GRANT SELECT ON tarsreplica.TEST_CENTRE TO 'refdata';
GRANT SELECT ON tarsreplica.TEST_CENTRE_NAME TO 'refdata';
