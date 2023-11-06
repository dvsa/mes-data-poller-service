import * as mysql from 'mysql2';
import * as moment from 'moment';
import { DeploymentRow, mapRow } from './row-mappers/deployment-row-mapper';
import { poolQuery } from '../../../../../common/framework/mysql/database';
import { customDurationMetric, info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { ExaminerDeployment } from '../../../domain/examiner-deployment';

/**
 * Get all deployments, for the specified time window.
 * @param connectionPool The MySQL connection pool to use
 * @param startDate The start date of the time window
 * @param durationMonths The duration of the time window, in months
 * @returns The deployments
 */
export const getDeployments = async (connectionPool: mysql.Pool, startDate: Date, durationMonths: number):
Promise<ExaminerDeployment[]> => {
  const windowStart = moment(startDate);
  const windowEnd = windowStart.clone().add({months: durationMonths}).subtract({days: 1});
  const sqlDateFormat = 'YYYY-MM-DD';
  const windowStartString = windowStart.format(sqlDateFormat);
  const windowEndString = windowEnd.format(sqlDateFormat);

  info(`running deployment query from on ${windowStartString} to ${windowEndString}...`);
  const start = new Date();
  const res: DeploymentRow[] = await poolQuery(
    connectionPool,
    mysql.format(
      `
          select d.deployment_id, e.individual_id, d.tc_id, tcn.tc_name, tc.tc_cost_centre_code, p.programme_date
          from EXAMINER e
                   join DEPLOYMENT d on e.individual_id = d.individual_id
                   join TEST_CENTRE tc on d.tc_id = tc.tc_id
                   join TEST_CENTRE_NAME tcn on d.tc_id = tcn.tc_id
                   join PROGRAMME p on p.individual_id = e.individual_id
          where DATE (p.programme_date) between DATE (d.start_date)
            and DATE (d.end_date)
            and (
              DATE (d.start_date) between ?
            and ?
             or DATE (d.end_date) between ?
            and ?
              )
            and p.tc_id = d.tc_id
            and IFNULL(e.grade_code
              , 'ZZZ') != 'DELE'
            and exists (
              select end_date
              from EXAMINER_STATUS es
              where es.individual_id = e.individual_id
            and IFNULL(es.end_date
              , '4000-01-01')
              > ?
              )
      `,
      [windowStartString, windowEndString, windowStartString, windowEndString, windowStartString],
    )
  );
  const results = res.map(mapRow);
  const end = new Date();
  info(`${results.length} deployments loaded and mapped`);
  customDurationMetric('DeploymentsQuery', 'Time taken querying deployments, in seconds', start, end);
  return results;
};
