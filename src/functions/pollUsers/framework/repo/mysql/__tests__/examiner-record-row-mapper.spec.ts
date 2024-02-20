import { buildStaffDetailsFromQueryResult } from '../examiner-record-row-mapper';
import { StaffDetail, TestPermissionPeriod } from '../../../../../../common/application/models/staff-details';
import { isEqual } from 'lodash';
import { ExaminerRole } from '../../../../domain/constants/examiner-roles';

describe('ExmainerRecordRowMapper', () => {
  const examinerRecords = [
    {
      individual_id: 1,
      staff_number: '01',
      test_category_ref: 'B',
      test_centre_manager_ind: 0,
      with_effect_from: new Date('2019-07-05'),
      with_effect_to: new Date('2019-07-12'),
    },
    {
      individual_id: 1,
      staff_number: '01',
      test_category_ref: 'B',
      test_centre_manager_ind: 0,
      with_effect_from: new Date('2019-08-01'),
      with_effect_to: null,
    },
    {
      individual_id: 1,
      staff_number: '01',
      test_category_ref: 'B+E',
      test_centre_manager_ind: 0,
      with_effect_from: new Date('2019-09-01'),
      with_effect_to: null,
    },
    {
      individual_id: 2,
      staff_number: '02',
      test_category_ref: 'B',
      test_centre_manager_ind: 1,
      with_effect_from: new Date('2019-10-01'),
      with_effect_to: null,
    },
  ];
  const universalPermissions: TestPermissionPeriod[] = [
    {
      testCategory: 'B',
      from: '2020-01-01',
      to: null,
    },
  ];

  it('should generate a staffDetail for each distinct examiner', () => {
    const result = buildStaffDetailsFromQueryResult(examinerRecords, universalPermissions);

    expect(result.length).toBe(2);
  });

  it('should put the staff number from the query result into the StaffDetail object without leading zeroes', () => {
    const result = buildStaffDetailsFromQueryResult(examinerRecords, universalPermissions);

    expect(result[0].staffNumber).toBe('1');
    expect(result[1].staffNumber).toBe('2');
  });

  it('should determine whether each examiner is an LDTM or not', () => {
    const result = buildStaffDetailsFromQueryResult(examinerRecords, universalPermissions);

    expect(result[0].role).toBe(ExaminerRole.DE);
    expect(result[1].role).toBe(ExaminerRole.LDTM);
  });

  it('should add a TestPermissionPeriod object for each category/date qualified record for the examiner', () => {
    const result = buildStaffDetailsFromQueryResult(examinerRecords, universalPermissions);

    expect(result[0].testPermissionPeriods.length).toBe(4);
    expect(result[1].testPermissionPeriods.length).toBe(2);
  });

  it('should include the permission period to/from dates correctly', () => {
    const result = buildStaffDetailsFromQueryResult(examinerRecords, universalPermissions);

    const examiner1PermissionPeriods = result[0].testPermissionPeriods;
    expect(examiner1PermissionPeriods[0]).toEqual({ testCategory: 'B', from: '2019-07-05', to: '2019-07-12' });
    expect(examiner1PermissionPeriods[1]).toEqual({ testCategory: 'B', from: '2019-08-01', to: null });
    expect(examiner1PermissionPeriods[2]).toEqual({ testCategory: 'B+E', from: '2019-09-01', to: null });

    const examiner2PermissionPeriods = result[1].testPermissionPeriods;
    expect(examiner2PermissionPeriods[0]).toEqual({ testCategory: 'B', from: '2019-10-01', to: null });
  });

  it('should handle an examiner record without any permissions', () => {
    const permissionlessExaminerRecord = {
      individual_id: 1,
      staff_number: '01',
      test_centre_manager_ind: 0,
      test_category_ref: null,
      with_effect_from: null,
      with_effect_to: null,
    };

    const result = buildStaffDetailsFromQueryResult([permissionlessExaminerRecord], []);

    expect(result).toEqual([new StaffDetail('1', ExaminerRole.DE)]);
  });

  it('should handle an manager record without any permissions', () => {
    const permissionlessManagerRecord = {
      individual_id: 1,
      staff_number: '01',
      test_centre_manager_ind: 1,
      test_category_ref: null,
      with_effect_from: null,
      with_effect_to: null,
    };

    const result = buildStaffDetailsFromQueryResult([permissionlessManagerRecord], []);
    expect(result).toEqual([new StaffDetail('1', ExaminerRole.LDTM)]);
  });

  it('should include universal permissions in each examiners StaffDetails', () => {
    const result = buildStaffDetailsFromQueryResult(examinerRecords, universalPermissions);

    expect(
      result[0].testPermissionPeriods
        .some(permPeriod => isEqual(permPeriod, universalPermissions[0])),
    ).toBe(true);
    expect(
      result[1].testPermissionPeriods
        .some(permPeriod => isEqual(permPeriod, universalPermissions[0])),
    ).toBe(true);
  });

  it('should not generate a StaffDetail object for any examiner records with a non-numeric staff number', () => {
    const nonNumericExaminerRecords = [
      {
        individual_id: 1,
        staff_number: 'o3',
        test_category_ref: 'B',
        test_centre_manager_ind: 0,
        with_effect_from: new Date('2019-07-05'),
        with_effect_to: new Date('2019-07-12'),
      },
      {
        individual_id: 1,
        staff_number: 'o1',
        test_category_ref: 'B',
        test_centre_manager_ind: 0,
        with_effect_from: new Date('2019-08-01'),
        with_effect_to: null,
      },
    ];

    const result = buildStaffDetailsFromQueryResult(nonNumericExaminerRecords, []);

    expect(result.length).toBe(0);
  });
});
