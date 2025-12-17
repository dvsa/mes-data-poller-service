import { StaffDetail, TestPermissionPeriod } from '../../../../common/application/models/staff-details';
import { getTARSConnection, query } from '../../../../common/framework/mysql/database';
import { buildStaffDetailsFromQueryResult } from './examiner-record-row';
import { ExaminerQueryRecord } from '../../../../common/application/models/examiner-details';
import { ActiveExaminersSql } from '../databases/mysql/active-examiners';

export const getActiveExaminers = async (
  universalPermissionPeriods: TestPermissionPeriod[],
): Promise<StaffDetail[]> => {
  const connection = getTARSConnection();
  const queryResult: ExaminerQueryRecord[] = await query(connection, ActiveExaminersSql());
  return buildStaffDetailsFromQueryResult(queryResult, universalPermissionPeriods);
};
