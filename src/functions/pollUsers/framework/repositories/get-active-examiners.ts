import { StaffDetail, TestPermissionPeriod } from '../../../../common/application/models/staff-details';
import { getTARSConnection, query } from '../../../../common/framework/mysql/database';
import { buildStaffDetailsFromQueryResult } from './examiner-record-row';
import { ExaminerQueryRecord } from '../../../../common/application/models/examiner-details';
import { ActiveExaminersSql } from '../databases/mysql/active-examiners';
import { getMockActiveExaminers } from '../../../pollJournals/framework/databases/s3bucket/S3MockJournalsRepository';
import {info} from '@dvsa/mes-microservice-common/application/utils/logger';

export const getActiveExaminers = async (
  universalPermissionPeriods: TestPermissionPeriod[],
): Promise<StaffDetail[]> => {
  if (process.env.USE_MOCK_TARS_DATA === 'true') {
    info('Getting mock activeExaminers');
    return buildStaffDetailsFromQueryResult(await getMockActiveExaminers(), universalPermissionPeriods);
  }
  const connection = getTARSConnection();
  const queryResult: ExaminerQueryRecord[] = await query(connection, ActiveExaminersSql());
  return buildStaffDetailsFromQueryResult(queryResult, universalPermissionPeriods);
};
