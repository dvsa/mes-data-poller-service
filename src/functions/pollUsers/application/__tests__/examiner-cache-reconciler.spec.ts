import { reconcileActiveAndCachedExaminers } from '../examiner-cache-reconciler';
import { Mock, It, Times } from 'typemoq';
import * as cachedExaminerRepository from '../../framework/databases/dynamodb/cached-examiner-repository';
import { StaffDetail } from '../../../../common/application/models/staff-details';
import { ExaminerRole } from '../constants/examiner-roles';

describe('examiner cache reconciler', () => {
  const moqCacheStaffNumbers = Mock.ofInstance(cachedExaminerRepository.cacheStaffDetails);
  const moqUncacheStaffNumbers = Mock.ofInstance(cachedExaminerRepository.uncacheStaffNumbers);

  beforeEach(() => {
    moqCacheStaffNumbers.reset();
    moqUncacheStaffNumbers.reset();

    spyOn(cachedExaminerRepository, 'cacheStaffDetails').and.callFake(moqCacheStaffNumbers.object);
    spyOn(cachedExaminerRepository, 'uncacheStaffNumbers').and.callFake(moqUncacheStaffNumbers.object);
  });

  describe('reconcileActiveAndCachedExaminers', () => {
    it('should issue writes to the cache for active examiners not already cached', async () => {
      const activeStaffDetails = [
        new StaffDetail('1', ExaminerRole.DE),
        new StaffDetail('2', ExaminerRole.LDTM),
      ];
      const cachedStaffDetails: StaffDetail[] = [];
      const cachedStaffNumbers: string[] = [];
      await reconcileActiveAndCachedExaminers(activeStaffDetails, cachedStaffDetails);

      moqCacheStaffNumbers.verify(x => x(It.isValue(activeStaffDetails)), Times.once());
      moqUncacheStaffNumbers.verify(x => x(It.isValue(cachedStaffNumbers)), Times.once());
    });

    it('should cache active examiners not already in the cache and ' +
            'uncache those that are cached but not active', async () => {
      const activeStaffDetails = [new StaffDetail('1', ExaminerRole.DE)];
      const cachedStaffDetails = [
        new StaffDetail('1', ExaminerRole.DE),
        new StaffDetail('2', ExaminerRole.LDTM),
        new StaffDetail('3', ExaminerRole.DE),
      ];
      await reconcileActiveAndCachedExaminers(activeStaffDetails, cachedStaffDetails);
      moqCacheStaffNumbers.verify(x => x(It.isValue([])), Times.once());
      moqUncacheStaffNumbers.verify(x => x(It.isValue(['2', '3'])), Times.once());
    });

    it('should omit journals whose staff numbers occur more ' +
            'than once in the active dataset', async () => {
      const activeStaffDetails = [
        new StaffDetail('1', ExaminerRole.DE),
        new StaffDetail('1', ExaminerRole.LDTM),
      ];
      const cachedStaffDetails: StaffDetail[] = [];
      const cachedStaffNumbers: string[] = [];
      await reconcileActiveAndCachedExaminers(activeStaffDetails, cachedStaffDetails);

      moqCacheStaffNumbers.verify(x => x(It.isValue([])), Times.once());
      moqUncacheStaffNumbers.verify(x => x(It.isValue(cachedStaffNumbers)), Times.once());
    });
  });

  describe('test permission handling', () => {
    it('should re-cache any examiner whose test permissions have changed', async () => {
      const cachedStaffDetails = [
        new StaffDetail('1', ExaminerRole.DE, [
          {
            testCategory: 'B',
            from: '1970-01-01',
            to: null,
          },
        ]),
      ];
      const activeStaffDetails = [
        new StaffDetail('1', ExaminerRole.DE, [
          {
            testCategory: 'B',
            from: '1970-01-02',
            to: null,
          },
        ]),
      ];

      await reconcileActiveAndCachedExaminers(activeStaffDetails, cachedStaffDetails);

      moqCacheStaffNumbers.verify(x => x(It.isValue(activeStaffDetails)), Times.once());
      moqUncacheStaffNumbers.verify(x => x(It.isValue([])), Times.once());
    });

    it('should not re-cache an examiner if all their staff details are identical', async () => {
      const staffDetails = [
        new StaffDetail('1', ExaminerRole.DE, [
          {
            testCategory: 'B',
            from: '1970-01-01',
            to: null,
          },
        ]),
        new StaffDetail('2', ExaminerRole.LDTM, [
          {
            testCategory: 'A',
            from: '1970-01-01',
            to: '1970-01-05',
          },
          {
            testCategory: 'A',
            from: '1971-01-01',
            to: '1971-01-05',
          },
        ]),
      ];

      await reconcileActiveAndCachedExaminers(staffDetails, staffDetails);

      moqCacheStaffNumbers.verify(x => x(It.isValue([])), Times.once());
      moqUncacheStaffNumbers.verify(x => x(It.isValue([])), Times.once());
    });

    it('it should identify if there is a difference between cached and active', async () => {
      const queryExaminers = [
        {
          staffNumber: '11111',
          role: 'DE',
          testPermissionPeriods: [
            {
              from: '2020-06-22',
              testCategory: 'F',
              to: null,
            },
            {
              from: '2020-06-22',
              testCategory: 'G',
              to: null,
            },
            {
              from: '2020-06-22',
              testCategory: 'H',
              to: null,
            },
            {
              from: '2020-06-22',
              testCategory: 'K',
              to: null,
            },
            {
              from: '2020-07-04',
              testCategory: 'B+E',
              to: null,
            },
            {
              from: '2020-07-04',
              testCategory: 'C',
              to: null,
            },
            {
              from: '2020-07-04',
              testCategory: 'C+E',
              to: null,
            },
            {
              from: '2020-07-04',
              testCategory: 'C1',
              to: null,
            },
            {
              from: '2020-07-04',
              testCategory: 'C1+E',
              to: null,
            },
            {
              from: '2020-07-04',
              testCategory: 'EUA1M1',
              to: null,
            },
            {
              from: '2020-07-04',
              testCategory: 'EUA2M1',
              to: null,
            },
            {
              from: '2020-07-04',
              testCategory: 'EUAM1',
              to: null,
            },
            {
              from: '2020-07-04',
              testCategory: 'EUAMM1',
              to: null,
            },
            {
              from: '2020-07-04',
              testCategory: 'D',
              to: null,
            },
            {
              from: '2020-07-04',
              testCategory: 'D1+E',
              to: null,
            },
            {
              from: '2020-07-04',
              testCategory: 'D+E',
              to: null,
            },
            {
              from: '2020-07-04',
              testCategory: 'D1',
              to: null,
            },
            {
              from: '2020-07-04',
              testCategory: 'EUAMM2',
              to: null,
            },
            {
              from: '2020-07-04',
              testCategory: 'EUA2M2',
              to: null,
            },
            {
              from: '2020-07-04',
              testCategory: 'EUAM2',
              to: null,
            },
            {
              from: '2020-07-04',
              testCategory: 'EUA1M2',
              to: null,
            },
            {
              from: '2021-11-15',
              testCategory: 'C+EM',
              to: null,
            },
            {
              from: '2021-11-15',
              testCategory: 'C1M',
              to: null,
            },
            {
              from: '2021-11-15',
              testCategory: 'C1+EM',
              to: null,
            },
            {
              from: '2021-11-15',
              testCategory: 'D1+EM',
              to: null,
            },
            {
              from: '2021-11-15',
              testCategory: 'D1M',
              to: null,
            },
            {
              from: '2021-11-15',
              testCategory: 'DM',
              to: null,
            },
            {
              from: '2021-11-15',
              testCategory: 'CM',
              to: null,
            },
            {
              from: '2021-11-15',
              testCategory: 'D+EM',
              to: null,
            },
            {
              from: '2020-09-09',
              testCategory: 'CCPC',
              to: null,
            },
            {
              from: '2020-09-09',
              testCategory: 'DCPC',
              to: null,
            },
            {
              from: '2020-11-27',
              testCategory: 'B',
              to: null,
            },
            {
              from: '2022-11-30',
              testCategory: 'ADI3',
              to: null,
            },
            {
              from: '2023-08-22',
              testCategory: 'SC',
              to: null,
            },
          ],
        },
      ];
      const cachedStaffDetails = [{
        staffNumber: '11111',
        role: 'DE',
        testPermissionPeriods: [
          {
            from: null,
            testCategory: null,
            to: null,
          },
          {
            from: '2020-06-22',
            testCategory: 'F',
            to: null,
          },
          {
            from: '2020-06-22',
            testCategory: 'G',
            to: null,
          },
          {
            from: '2020-06-22',
            testCategory: 'H',
            to: null,
          },
          {
            from: '2020-06-22',
            testCategory: 'K',
            to: null,
          },
          {
            from: '2020-07-04',
            testCategory: 'B+E',
            to: null,
          },
          {
            from: '2020-07-04',
            testCategory: 'C',
            to: null,
          },
          {
            from: '2020-07-04',
            testCategory: 'C+E',
            to: null,
          },
          {
            from: '2020-07-04',
            testCategory: 'C1',
            to: null,
          },
          {
            from: '2020-07-04',
            testCategory: 'C1+E',
            to: null,
          },
          {
            from: '2020-07-04',
            testCategory: 'EUA1M1',
            to: null,
          },
          {
            from: '2020-07-04',
            testCategory: 'EUA2M1',
            to: null,
          },
          {
            from: '2020-07-04',
            testCategory: 'EUAM1',
            to: null,
          },
          {
            from: '2020-07-04',
            testCategory: 'EUAMM1',
            to: null,
          },
          {
            from: '2020-07-04',
            testCategory: 'D',
            to: null,
          },
          {
            from: '2020-07-04',
            testCategory: 'D1+E',
            to: null,
          },
          {
            from: '2020-07-04',
            testCategory: 'D+E',
            to: null,
          },
          {
            from: '2020-07-04',
            testCategory: 'D1',
            to: null,
          },
          {
            from: '2020-07-04',
            testCategory: 'EUAMM2',
            to: null,
          },
          {
            from: '2020-07-04',
            testCategory: 'EUA2M2',
            to: null,
          },
          {
            from: '2020-07-04',
            testCategory: 'EUAM2',
            to: null,
          },
          {
            from: '2020-07-04',
            testCategory: 'EUA1M2',
            to: null,
          },
          {
            from: '2021-11-15',
            testCategory: 'C+EM',
            to: null,
          },
          {
            from: '2021-11-15',
            testCategory: 'C1M',
            to: null,
          },
          {
            from: '2021-11-15',
            testCategory: 'C1+EM',
            to: null,
          },
          {
            from: '2021-11-15',
            testCategory: 'D1+EM',
            to: null,
          },
          {
            from: '2021-11-15',
            testCategory: 'D1M',
            to: null,
          },
          {
            from: '2021-11-15',
            testCategory: 'DM',
            to: null,
          },
          {
            from: '2021-11-15',
            testCategory: 'CM',
            to: null,
          },
          {
            from: '2021-11-15',
            testCategory: 'D+EM',
            to: null,
          },
          {
            from: '2020-09-09',
            testCategory: 'CCPC',
            to: null,
          },
          {
            from: '2020-09-09',
            testCategory: 'DCPC',
            to: null,
          },
          {
            from: '2020-11-27',
            testCategory: 'B',
            to: null,
          },
          {
            from: '2022-11-30',
            testCategory: 'ADI3',
            to: null,
          },
          {
            from: '2023-08-22',
            testCategory: 'SC',
            to: null,
          },
        ],
      }];

      await reconcileActiveAndCachedExaminers(queryExaminers, cachedStaffDetails);

      moqCacheStaffNumbers.verify(x => x(It.isValue(queryExaminers)), Times.once());
      moqUncacheStaffNumbers.verify(x => x(It.isValue([])), Times.once());
    });
  });
});
