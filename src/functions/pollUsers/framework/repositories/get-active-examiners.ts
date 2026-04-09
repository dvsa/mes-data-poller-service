import { info } from '@dvsa/mes-microservice-common/application/utils/logger';
import type { ExaminerQueryRecord } from '../../../../common/application/models/examiner-details';
import type { StaffDetail, TestPermissionPeriod } from '../../../../common/application/models/staff-details';
import { getTARSConnection, query } from '../../../../common/framework/mysql/database';
import { getMockActiveExaminers } from '../../../../common/framework/s3bucket/S3MockJournalsRepository';
import { ActiveExaminersSql } from '../databases/mysql/active-examiners';
import { buildStaffDetailsFromQueryResult } from './examiner-record-row';

export const getActiveExaminers = async (
  universalPermissionPeriods: TestPermissionPeriod[]
): Promise<StaffDetail[]> => {
  if (process.env.USE_MOCK_TARS_DATA === 'true') {
    info('Getting mock activeExaminers');
    return buildStaffDetailsFromQueryResult(await getMockActiveExaminers(), universalPermissionPeriods);
  }
  const connection = getTARSConnection();
  const queryResult: ExaminerQueryRecord[] = await query(connection, ActiveExaminersSql());
  return buildStaffDetailsFromQueryResult(queryResult, universalPermissionPeriods);
};
