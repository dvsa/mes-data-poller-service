export type Examiner = {
  name: string;
  staffNumber: string;
};

export class TestCentreDetail {
  staffNumber: string;
  examiners: Examiner[];
  testCentreCostCodes: string[];

  constructor(staffNumber: string, examiners: Examiner[], testCentreCostCodes: string[]) {
    this.staffNumber = staffNumber;
    this.examiners = examiners;
    this.testCentreCostCodes = testCentreCostCodes;
  }
}
