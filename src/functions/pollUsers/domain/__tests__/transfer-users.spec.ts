import { Mock, It, Times } from 'typemoq';
import * as examinerRepository from '../../framework/repo/mysql/examiner-repository';
import { transferUsers } from '../transfer-users';
import * as cachedExaminerRepository from '../../framework/repo/dynamodb/cached-examiner-repository';
import * as examinerCacheReconciler from '../examiner-cache-reconciler';
import { StaffDetail, TestPermissionPeriod } from '../../../../common/application/models/staff-details';
import * as universalPermissionsRepository from '../../framework/repo/mysql/universal-permissions-repository';
import { ExaminerRole } from '../constants/examiner-roles';

/* tslint:disable:max-line-length */
describe('transferUsers module', () => {
  const moqExaminerRepo = Mock.ofInstance(examinerRepository.getActiveExaminers);
  const moqCachedExaminerRepo = Mock.ofInstance(cachedExaminerRepository.getCachedExaminers);
  const moqReconciler = Mock.ofInstance(examinerCacheReconciler.reconcileActiveAndCachedExaminers);
  const moqUniversalPermissionsRepository = Mock.ofInstance(universalPermissionsRepository.getUniversalTestPermissions);

  beforeEach(() => {
    moqExaminerRepo.reset();
    moqCachedExaminerRepo.reset();
    moqReconciler.reset();
    moqUniversalPermissionsRepository.reset();

    spyOn(examinerRepository, 'getActiveExaminers').and.callFake(moqExaminerRepo.object);
    spyOn(cachedExaminerRepository, 'getCachedExaminers').and.callFake(moqCachedExaminerRepo.object);
    spyOn(examinerCacheReconciler, 'reconcileActiveAndCachedExaminers').and.callFake(moqReconciler.object);
    spyOn(universalPermissionsRepository, 'getUniversalTestPermissions')
      .and.callFake(moqUniversalPermissionsRepository.object);
  });
  describe('transferUsers', () => {
    // eslint-disable-next-line max-len
    it('should retrieve all the active examiners in the replica, all the IDs in the cache and pass them to the reconciler', async () => {
      const univeralPermissionPeriods: TestPermissionPeriod[] = [
        {
          testCategory: 'B',
          from: '2019-08-01',
          to: null,
        },
      ];
      const activeStaffDetails = [
        new StaffDetail('1', ExaminerRole.DE, univeralPermissionPeriods),
        new StaffDetail('2', ExaminerRole.LDTM, univeralPermissionPeriods),
      ];
      const cachedStaffDetails = [
        new StaffDetail('1', ExaminerRole.DE, univeralPermissionPeriods),
        new StaffDetail('2', ExaminerRole.LDTM, univeralPermissionPeriods),
        new StaffDetail('5', ExaminerRole.DE, univeralPermissionPeriods),
      ];
      moqExaminerRepo.setup(
        x => x(It.isValue(univeralPermissionPeriods))
      ).returns(() => Promise.resolve(activeStaffDetails));
      moqCachedExaminerRepo.setup(x => x()).returns(() => Promise.resolve(cachedStaffDetails));
      moqUniversalPermissionsRepository.setup(x => x()).returns(() => Promise.resolve(univeralPermissionPeriods));

      await transferUsers();

      moqUniversalPermissionsRepository.verify(x => x(), Times.once());
      moqReconciler.verify(x => x(It.isValue(activeStaffDetails), It.isValue(cachedStaffDetails)), Times.once());
    });
  });
});
