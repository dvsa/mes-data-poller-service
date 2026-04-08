export class StaffDetail {
  staffNumber: string;
  role: string;
  testPermissionPeriods: TestPermissionPeriod[];

  constructor(staffNumber: string, role: string, testPermissionPeriods: TestPermissionPeriod[] = []) {
    this.staffNumber = staffNumber;
    this.role = role;
    this.testPermissionPeriods = testPermissionPeriods;
  }
}

export interface TestPermissionPeriod {
  testCategory: string;
  from: string;
  to: string | null;
}
