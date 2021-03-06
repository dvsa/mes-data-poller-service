import * as mysql from 'mysql2';

import { config } from '../../config';
import { certificate } from '../../../../../common/certs/ssl_profiles';
import { query } from '../../../../../common/framework/mysql/database';
import { buildTestCentreRowsFromQueryResult } from './test-centre-row-mapper';
import { TestCentreDetail } from '../../../../../common/application/models/test-centre';

export interface TestCentreRow {
  INDIVIDUAL_ID: string;
  STAFF_NUMBER: string;
  STAFF_NUMBERS: string;
  TEST_CENTRES: string;
}

export const getActiveTestCentreExaminers = async (): Promise<TestCentreDetail[]> => {
  const configuration = config();

  const connection = mysql.createConnection({
    host: configuration.tarsReplicaDatabaseHostname,
    database: configuration.tarsReplicaDatabaseName,
    user: configuration.tarsReplicaDatabaseUsername,
    password: configuration.tarsReplicaDatabasePassword,
    charset: 'UTF8_GENERAL_CI',
    ssl: process.env.TESTING_MODE ? null : certificate,
    authSwitchHandler(data, cb) {
      if (data.pluginName === 'mysql_clear_password') {
        cb(null, Buffer.from(`${configuration.tarsReplicaDatabasePassword}\0`));
      }
    },
  });

  await query(connection, 'SET SESSION group_concat_max_len = 65000');
  const queryResult: TestCentreRow[] = await query(connection, getTestCentreQuery());
  return buildTestCentreRowsFromQueryResult(queryResult);
};

const getTestCentreQuery = (): string => {
  return `
SELECT E.INDIVIDUAL_ID                   AS INDIVIDUAL_ID,
       E.STAFF_NUMBER                    AS STAFF_NUMBER,
       GROUP_CONCAT(DISTINCT PS.TC_ID) AS TEST_CENTRES,
       t3.STAFF_NUMBERS
FROM EXAMINER AS E
         INNER JOIN
     (SELECT *
      FROM PROGRAMME_SLOT
      WHERE DATE(PROGRAMME_DATE) = DATE(CURRENT_DATE())
         OR DATE(PROGRAMME_DATE) = DATE(CURRENT_DATE + INTERVAL 1 DAY)) AS PS
     ON E.INDIVIDUAL_ID = PS.INDIVIDUAL_ID


         INNER JOIN (
    SELECT DISTINCT PS1.INDIVIDUAL_ID,
                    GROUP_CONCAT(DISTINCT CONCAT('{"staffNumber": "',
                     t2.STAFF_NUMBER, '", "name": "', t2.FIRST_FORENAME, ' ',
                                                 t2.FAMILY_NAME, '"}')) AS STAFF_NUMBERS
    FROM PROGRAMME_SLOT AS PS1
             LEFT JOIN (
        SELECT DISTINCT PS2.INDIVIDUAL_ID,
                        E2.STAFF_NUMBER,
                        PS2.TC_ID,
                        I.FIRST_FORENAME,
                        I.FAMILY_NAME
        FROM (SELECT *
              FROM PROGRAMME_SLOT
              WHERE DATE(PROGRAMME_DATE) = DATE(CURRENT_DATE())
                 OR DATE(PROGRAMME_DATE) = DATE(CURRENT_DATE + INTERVAL 1 DAY)) AS PS2,
             EXAMINER AS E2,
             INDIVIDUAL AS I
        WHERE PS2.INDIVIDUAL_ID = I.INDIVIDUAL_ID
          AND E2.INDIVIDUAL_ID = PS2.INDIVIDUAL_ID
          AND E2.GRADE_CODE <> 'DELE'
    ) t2 ON PS1.TC_ID = t2.TC_ID
    GROUP BY PS1.INDIVIDUAL_ID
) t3 ON t3.INDIVIDUAL_ID = E.INDIVIDUAL_ID
WHERE E.GRADE_CODE <> 'DELE'
GROUP BY STAFF_NUMBER, INDIVIDUAL_ID
  `;
};
