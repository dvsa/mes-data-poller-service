/* tslint:disable:max-line-length */
import { reconcileActiveAndCachedExaminers } from '../examiner-cache-reconciler';
import { Mock, It, Times } from 'typemoq';
import * as cachedExaminerRepository from '../../framework/repo/dynamodb/cached-examiner-repository';
import { StaffDetail } from '../../../../common/application/models/staff-details';

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
    it('should issue writes to the cache for every active examiner not already cached', async () => {
      const activeStaffDetails = [new StaffDetail('1', 'LDTM'), new StaffDetail('2', 'DE')];
      const cachedStaffNumbers: string[] = [];
      await reconcileActiveAndCachedExaminers(activeStaffDetails, cachedStaffNumbers);

      moqCacheStaffNumbers.verify(x => x(It.isValue(activeStaffDetails)), Times.once());
      moqUncacheStaffNumbers.verify(x => x(It.isValue(cachedStaffNumbers)), Times.once());
    });

    it('should cache active examiners not already in the cache and uncache those that are cached but not active', async () => {
      const activeStaffDetails = [new StaffDetail('1', 'LDTM')];
      const cachedStaffNumbers = ['1', '2', '3'];
      await reconcileActiveAndCachedExaminers(activeStaffDetails, cachedStaffNumbers);
      moqCacheStaffNumbers.verify(x => x(It.isValue([])), Times.once());
      moqUncacheStaffNumbers.verify(x => x(It.isValue(['2', '3'])), Times.once());
    });
  });
});
