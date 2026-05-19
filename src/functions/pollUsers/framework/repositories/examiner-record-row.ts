import { error, info, warn } from '@dvsa/mes-microservice-common/application/utils/logger';
import { groupBy } from 'lodash';
import type { ExaminerQueryRecord } from '../../../../common/application/models/examiner-details';
import { StaffDetail, type TestPermissionPeriod } from '../../../../common/application/models/staff-details';
import { trimLeadingZeroes } from '../../../../common/application/utils/trimLeadingZeros';
import { ExaminerRole } from '../../application/constants/examiner-roles';

export const buildStaffDetailsFromQueryResult = (
  queryResult: ExaminerQueryRecord[],
  universalTestPermissions: TestPermissionPeriod[]
): StaffDetail[] => {
  try {
    info('building staff details from query result', queryResult, universalTestPermissions);
    const queryResultsByExaminer = groupBy(queryResult, (record) => record.staff_number);

    return Object.values(queryResultsByExaminer).reduce((staffDetailsAcc, recordsForExaminer) => {
      const recordStaffNumber = recordsForExaminer[0].staff_number;
      const staffNumber = trimLeadingZeroes(recordStaffNumber);

      if (staffNumber === null) {
        warn('Omitting user record for non-numeric staff number', recordStaffNumber);
        return staffDetailsAcc;
      }

      const role = recordsForExaminer[0]?.test_centre_manager_ind === 1 ? ExaminerRole.LDTM : ExaminerRole.DE;

      // filter records where category and effective date is null
      const records = recordsForExaminer.filter(
        (rec) => rec.test_category_ref !== null && rec.with_effect_from !== null
      );
      const formatDate = (date: Date) => (date === null ? null : date.toISOString().split('T')[0]);

      const testPermissionPeriods: TestPermissionPeriod[] = examinerHasPermissions(records)
        ? [
            ...records.map((record) => ({
              testCategory: record.test_category_ref,
              from: formatDate(record.with_effect_from),
              to: formatDate(record.with_effect_to),
            })),
            ...universalTestPermissions,
          ]
        : universalTestPermissions;

      staffDetailsAcc.push(new StaffDetail(staffNumber, role, testPermissionPeriods));
      return staffDetailsAcc;
    }, [] as StaffDetail[]);
  } catch (err) {
    error('Error building staff details', err);
    return [];
  }
};

const examinerHasPermissions = (examinerRecords: ExaminerQueryRecord[]): boolean => {
  return examinerRecords.length !== 1 || examinerRecords[0].test_category_ref !== null;
};
