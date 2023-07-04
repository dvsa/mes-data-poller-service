import { Mock, It, Times } from 'typemoq';
import * as testCentreRepository from '../../framework/repo/mysql/test-centre-repository';
import * as cachedTestCentreRepository from '../../framework/repo/dynamodb/cached-test-centre-repository';
import * as testCentreCacheReconciler from '../test-centre-cache-reconciler';
import { transferTestCentreExaminers } from '../transfer-test-centre-examiners';
import { TestCentreDetail } from '../../../../common/application/models/test-centre';

describe('transferTestCentreExaminers', () => {
  const moqTestCentreRepo = Mock.ofInstance(testCentreRepository.getActiveTestCentreExaminers);
  const moqCachedTestCentreRepo = Mock.ofInstance(cachedTestCentreRepository.getCachedTestCentreExaminers);
  const moqReconciler = Mock.ofInstance(testCentreCacheReconciler.reconcileActiveAndCachedTestCentreRows);

  beforeEach(() => {
    moqTestCentreRepo.reset();
    moqCachedTestCentreRepo.reset();
    moqReconciler.reset();

    spyOn(testCentreRepository, 'getActiveTestCentreExaminers')
      .and.callFake(moqTestCentreRepo.object);
    spyOn(cachedTestCentreRepository, 'getCachedTestCentreExaminers')
      .and.callFake(moqCachedTestCentreRepo.object);
    spyOn(testCentreCacheReconciler, 'reconcileActiveAndCachedTestCentreRows')
      .and.callFake(moqReconciler.object);
  });
  describe('transferTestCentreExaminers', () => {
    it('should retrieve all the active rows in the replica, ' +
        'all the staffNums in the cache and pass them to the reconciler', async () => {
      const activeTestCentres = [
        new TestCentreDetail(123, [{ staffNumber: '345', name: 'A' }], [1234]),
        new TestCentreDetail(456, [{ staffNumber: '432', name: 'B' }], [2341]),
      ];
      const cachedTestCentres = [
        new TestCentreDetail(123, [{ staffNumber: '345', name: 'A' }], [1234]),
        new TestCentreDetail(456, [{ staffNumber: '432', name: 'B' }], [2341]),
        new TestCentreDetail(789, [{ staffNumber: '245', name: 'B' }], [8740]),
      ];
      moqTestCentreRepo.setup(x => x()).returns(() => Promise.resolve(activeTestCentres));
      moqCachedTestCentreRepo.setup(x => x()).returns(() => Promise.resolve(cachedTestCentres));

      await transferTestCentreExaminers();
      moqReconciler.verify(x => x(
        It.isValue(activeTestCentres),
        It.isValue(cachedTestCentres)
      ), Times.once());
    });
  });
});
