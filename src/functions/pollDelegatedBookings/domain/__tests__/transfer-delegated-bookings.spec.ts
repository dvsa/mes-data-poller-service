import { Mock, It, Times } from 'typemoq';
import * as delegatedBookingsRepository from '../../framework/repo/mysql/delegated-examiner-bookings-repository';
import { transferDelegatedBookings } from '../transfer-delegated-bookings';
import * as cachedDelegatedBookingsRepository from '../../framework/repo/dynamodb/cached-delegated-bookings-repository';
import * as delegatedBookingsCacheReconciler from '../delegated-bookings-cache-reconciler';
import { DelegatedBookingDetail } from '../../../../common/application/models/delegated-booking-details';

describe('transferDelegatedBookings module', () => {
  const moqDelBookingsRepo = Mock.ofInstance(delegatedBookingsRepository.getActiveDelegatedExaminerBookings);
  const moqCachedDelBookingRepo = Mock.ofInstance(cachedDelegatedBookingsRepository.getCachedDelegatedExaminerBookings);
  const moqReconciler = Mock.ofInstance(delegatedBookingsCacheReconciler.reconcileActiveAndCachedDelegatedBookings);

  beforeEach(() => {
    moqDelBookingsRepo.reset();
    moqCachedDelBookingRepo.reset();
    moqReconciler.reset();

    spyOn(delegatedBookingsRepository, 'getActiveDelegatedExaminerBookings')
      .and.callFake(moqDelBookingsRepo.object);
    spyOn(cachedDelegatedBookingsRepository, 'getCachedDelegatedExaminerBookings')
      .and.callFake(moqCachedDelBookingRepo.object);
    spyOn(delegatedBookingsCacheReconciler, 'reconcileActiveAndCachedDelegatedBookings')
      .and.callFake(moqReconciler.object);
  });
  describe('transferDelegatedBookings', () => {
    // eslint-disable-next-line max-len
    it('should retrieve all the active examiners in the replica, all the IDs in the cache and pass them to the reconciler', async () => {
      const buffer = Buffer.from('');
      const activeBookings = [
        new DelegatedBookingDetail(12345678910, '987654', buffer),
        new DelegatedBookingDetail(12345678911, '123654', buffer),
      ];
      const cachedBookingsDetails = [
        new DelegatedBookingDetail(12345678910, '456654', buffer),
        new DelegatedBookingDetail(12345678911, '222001', buffer),
        new DelegatedBookingDetail(12345678912, '833201', buffer),
      ];
      moqDelBookingsRepo.setup(x => x()).returns(() => Promise.resolve(activeBookings));
      moqCachedDelBookingRepo.setup(x => x()).returns(() => Promise.resolve(cachedBookingsDetails));

      await transferDelegatedBookings();
      moqReconciler.verify(
        x => x(
          It.isValue(activeBookings),
          It.isValue(cachedBookingsDetails),
          It.isAny()
        ), Times.once());
    });
  });
});
