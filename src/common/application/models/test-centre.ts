export type Examiner = {
  name: string;
  staffNumber: string;
};

export class TestCentreDetail {
  staffNumber: string;
  examiners: Examiner[];
  testCentreIDs: number[];

  constructor(staffNumber: string, examiners: Examiner[], testCentreIDs: number[]) {
    this.staffNumber = staffNumber;
    this.examiners = examiners;
    this.testCentreIDs = testCentreIDs;
  }
}
