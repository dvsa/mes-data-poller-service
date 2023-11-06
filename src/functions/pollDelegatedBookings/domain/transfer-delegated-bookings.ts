import {debug, info} from '@dvsa/mes-microservice-common/application/utils/logger';
import { DelegatedBookingDetail } from '../../../common/application/models/delegated-booking-details';
import { getActiveDelegatedExaminerBookings } from '../framework/repo/mysql/delegated-examiner-bookings-repository';
import { reconcileActiveAndCachedDelegatedBookings } from './delegated-bookings-cache-reconciler';
import { getCachedDelegatedExaminerBookings } from '../framework/repo/dynamodb/cached-delegated-bookings-repository';
import { DateTime } from '../../../common/application/utils/date-time';

export const transferDelegatedBookings = async (): Promise<void> => {
  const activeDelegatedBookings: DelegatedBookingDetail[] = await getActiveDelegatedExaminerBookings();
  info(`Number of active delegated bookings: ${activeDelegatedBookings.length}`);

  const cachedDelegatedBookings: DelegatedBookingDetail[] = await getCachedDelegatedExaminerBookings();
  info(`Number of cached delegated bookings: ${cachedDelegatedBookings.length}`);

  debug('Reconciling active and cached bookings');
  await reconcileActiveAndCachedDelegatedBookings(
    activeDelegatedBookings,
    cachedDelegatedBookings,
    new DateTime(),
  );
};
