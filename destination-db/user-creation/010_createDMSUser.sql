CREATE USER IF NOT EXISTS 'dms_user' IDENTIFIED WITH mysql_native_password BY '<USER_PASSWORD>' PASSWORD EXPIRE NEVER;

GRANT ALL ON tarsreplica.* TO 'dms_user';

GRANT ALL ON awsdms_control.* TO 'dms_user';