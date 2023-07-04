import { Mock, It, Times } from 'typemoq';
import { reconcileActiveAndCachedTestCentreRows } from '../test-centre-cache-reconciler';
import * as cachedTestCentreRepository from '../../framework/repo/dynamodb/cached-test-centre-repository';
import { TestCentreDetail } from '../../../../common/application/models/test-centre';

describe('Test centre cache reconciler', () => {
  const moqCacheTestCentres = Mock.ofInstance(cachedTestCentreRepository.updateTestCentreExaminers);
  const moqUncacheTestCentres = Mock.ofInstance(cachedTestCentreRepository.unCacheTestCentreExaminers);

  beforeEach(() => {
    moqCacheTestCentres.reset();
    moqUncacheTestCentres.reset();

    spyOn(cachedTestCentreRepository, 'updateTestCentreExaminers').and.callFake(moqCacheTestCentres.object);
    spyOn(cachedTestCentreRepository, 'unCacheTestCentreExaminers').and.callFake(moqUncacheTestCentres.object);
  });

  describe('reconcileActiveAndCachedTestCentreRows', () => {
    it('should update all active rows', async () => {
      const activeTestCentres = [
        new TestCentreDetail(123, [], []),
        new TestCentreDetail(456, [], []),
        new TestCentreDetail(789, [], []),
      ];
      const cachedTestCentres = [];
      await reconcileActiveAndCachedTestCentreRows(activeTestCentres, cachedTestCentres);
      moqCacheTestCentres.verify(x => x(It.isValue(activeTestCentres)), Times.once());
    });
    it('should determine the non-active test rows and pass them to unCache function', async () => {
      const activeTestCentres = [
        new TestCentreDetail(123, [], []),
      ];
      const cachedTestCentres = [
        new TestCentreDetail(456, [], []),
        new TestCentreDetail(789, [], []),
      ];
      await reconcileActiveAndCachedTestCentreRows(activeTestCentres, cachedTestCentres);
      moqCacheTestCentres.verify(x => x(It.isValue(activeTestCentres)), Times.once());
      moqUncacheTestCentres.verify(x => x(It.isValue([456, 789])), Times.once());
    });
    it('should not unCache row if table is empty', async () => {
      const activeTestCentres = [
        new TestCentreDetail(123, [], []),
      ];
      const cachedTestCentres = [];
      await reconcileActiveAndCachedTestCentreRows(activeTestCentres, cachedTestCentres);
      moqCacheTestCentres.verify(x => x(It.isValue(activeTestCentres)), Times.once());
      moqUncacheTestCentres.verify(x => x(It.isValue([])), Times.once());
    });
  });
});
