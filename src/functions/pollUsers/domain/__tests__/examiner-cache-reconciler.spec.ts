/* tslint:disable:max-line-length */
import { reconcileActiveAndCachedExaminers } from '../examiner-cache-reconciler';
import { Mock, It, Times } from 'typemoq';
import * as cachedExaminerRepository from '../../framework/repo/dynamodb/cached-examiner-repository';
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
      const activeStaffDetails = [new StaffDetail('1', ExaminerRole.DE), new StaffDetail('2', ExaminerRole.LDTM)];
      const cachedStaffDetails: StaffDetail[] = [];
      const cachedStaffNumbers: string[] = [];
      await reconcileActiveAndCachedExaminers(activeStaffDetails, cachedStaffDetails);

      moqCacheStaffNumbers.verify(x => x(It.isValue(activeStaffDetails)), Times.once());
      moqUncacheStaffNumbers.verify(x => x(It.isValue(cachedStaffNumbers)), Times.once());
    });

    // eslint-disable-next-line max-len
    it('should cache active examiners not already in the cache and uncache those that are cached but not active', async () => {
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

    it('should omit journals whose staff numbers occur more than once in the active dataset', async () => {
      const activeStaffDetails = [new StaffDetail('1', ExaminerRole.DE), new StaffDetail('1', ExaminerRole.LDTM)];
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
  });
});
