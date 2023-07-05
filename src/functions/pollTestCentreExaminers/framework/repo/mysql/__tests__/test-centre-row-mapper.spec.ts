import { TestCentreRow } from '../test-centre-repository';
import { mapExaminers, mapTestCentreIDs, buildTestCentreRowsFromQueryResult } from '../test-centre-row-mapper';
import { TestCentreDetail } from '../../../../../../common/application/models/test-centre';
import { mockTestCentreRows } from './test-centre-row-mapper.mock';

describe('TestCentreMapper', () => {
  describe('buildTestCentreRowsFromQueryResult', () => {
    it('should map the first row from the query', () => {
      const ex = [
        {name: 'Test Examiner Seven', staffNumber: '8'},
        {name: 'Test Examiner Six', staffNumber: '7'},
        {name: 'Test Examiner Five', staffNumber: '6'},
      ];
      expect(buildTestCentreRowsFromQueryResult(mockTestCentreRows)[0]).toEqual(
        new TestCentreDetail(1234567, ex, [1234, 9087]),
      );
    });
    it('should map the second row from the query', () => {
      const ex = [
        {name: 'Test Examiner Three', staffNumber: '4'},
        {name: 'Test Examiner Eight', staffNumber: '9'},
        {name: 'Test Examiner Two', staffNumber: '3'},
      ];
      expect(buildTestCentreRowsFromQueryResult(mockTestCentreRows)[1]).toEqual(
        new TestCentreDetail(3242339, ex, [3452, 6578]),
      );
    });
  });
  describe('mapTestCentreIDs', () => {
    it('should parse a string like value into a list of test centre ids', () => {
      const row = {
        TEST_CENTRES: '127,7169,543',
      } as TestCentreRow;
      expect(mapTestCentreIDs(row)).toEqual([127, 7169, 543]);
    });
  });
  describe('mapExaminers', () => {
    it('should parse a string like value into a list of staffNumber & name objects', () => {
      const row = {
        // eslint-disable-next-line max-len
        STAFF_NUMBERS: '{"staffNumber": "8", "name": "Test Examiner Seven"}, {"staffNumber": "7", "name": "Test Examiner Six"}, {"staffNumber": "6", "name": "Test Examiner Five"}, {"staffNumber": "18", "name": "Test Examiner Eighteen"},{"staffNumber": "5", "name": "Test Examiner Four"},{"staffNumber": "13", "name": "Test Examiner Eleven"},{"staffNumber": "4", "name": "Test Examiner Three"},{"staffNumber": "9", "name": "Test Examiner Eight"},{"staffNumber": "3", "name": "Test Examiner Two"}',
      } as TestCentreRow;
      expect(mapExaminers(row)).toEqual([
        {staffNumber: '8', name: 'Test Examiner Seven'},
        {staffNumber: '7', name: 'Test Examiner Six'},
        {staffNumber: '6', name: 'Test Examiner Five'},
        {staffNumber: '18', name: 'Test Examiner Eighteen'},
        {staffNumber: '5', name: 'Test Examiner Four'},
        {staffNumber: '13', name: 'Test Examiner Eleven'},
        {staffNumber: '4', name: 'Test Examiner Three'},
        {staffNumber: '9', name: 'Test Examiner Eight'},
        {staffNumber: '3', name: 'Test Examiner Two'},
      ]);
    });
  });
});
