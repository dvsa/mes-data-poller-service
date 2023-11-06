import {
  unCacheDelegatedBookingDetails,
  cacheDelegatedBookingDetails,
} from '../framework/repo/dynamodb/cached-delegated-bookings-repository';
import { DelegatedBookingDetail } from '../../../common/application/models/delegated-booking-details';
import { DateTime } from '../../../common/application/utils/date-time';
import { decompressDelegatedBooking } from '../application/booking-compressor';
import { debug, info } from '@dvsa/mes-microservice-common/application/utils/logger';

const NUMBER_OF_DAYS_TO_RETAIN_CACHED_BOOKINGS = 60;

export const reconcileActiveAndCachedDelegatedBookings = async (
  activeDelegatedBookingsSlots: DelegatedBookingDetail[],
  cachedDelegatedBookingsSlots: DelegatedBookingDetail[],
  todaysDate: DateTime,
): Promise<void> => {
  info('Determining cached app refs eligible for deletion');
  const cachedAppRefsEligibleForDeletion =
    extractCachedBookingsEligibleForDeletion(cachedDelegatedBookingsSlots, activeDelegatedBookingsSlots, todaysDate)
      .map(delegatedTestSlot => delegatedTestSlot.applicationReference);

  info('Sending delete command for eligible app refs');
  await unCacheDelegatedBookingDetails(cachedAppRefsEligibleForDeletion);

  info('Determining app refs to cache');
  const delegatedBookingDetailsToCache =
    selectDelegatedBookingsToCache(activeDelegatedBookingsSlots, cachedDelegatedBookingsSlots);

  info('Caching new bookings');
  await cacheDelegatedBookingDetails(delegatedBookingDetailsToCache);
};

const selectDelegatedBookingsToCache = (
  activeDelegatedBookingsSlots: DelegatedBookingDetail[],
  cachedDelegatedBookingsSlots: DelegatedBookingDetail[],
): DelegatedBookingDetail[] => {

  return activeDelegatedBookingsSlots.filter((activeDelegatedBooking: DelegatedBookingDetail) => {
    return delegatedBookingsEligibleForCache(activeDelegatedBooking, cachedDelegatedBookingsSlots);
  });
};

const delegatedBookingsEligibleForCache = (
  delegatedBooking: DelegatedBookingDetail,
  cachedDelegatedBookings: DelegatedBookingDetail[],
): boolean => {

  const oldDelegatedBooking = cachedDelegatedBookings.find((cachedDelegatedBooking: DelegatedBookingDetail) => {
    return cachedDelegatedBooking.applicationReference === delegatedBooking.applicationReference;
  });

  // Booking not in cache already, allow through filter
  if (!oldDelegatedBooking) {
    return true;
  }

  return !appRefsAreEqual(delegatedBooking, oldDelegatedBooking);
};

const appRefsAreEqual = (
  sd1: DelegatedBookingDetail,
  sd2: DelegatedBookingDetail,
): boolean => (
  sd1.applicationReference === sd2.applicationReference &&
  Buffer.compare(sd1.bookingDetail, sd2.bookingDetail) === 0 &&
  sd1.staffNumber === sd2.staffNumber
);

const extractCachedBookingsEligibleForDeletion = (
  cachedDelegatedBookingsSlots: DelegatedBookingDetail[],
  activeDelegatedBookingsSlots: DelegatedBookingDetail[],
  todaysDate: DateTime
): DelegatedBookingDetail[] => {

  const activeAppRefs = activeDelegatedBookingsSlots.map(delegatedTestSlot => delegatedTestSlot.applicationReference);

  return cachedDelegatedBookingsSlots.filter((bookingSlot) => {
    if (activeAppRefs.includes(bookingSlot.applicationReference)) return false;

    debug('Unzipping app ref:', bookingSlot.applicationReference);

    const unzippedSlot = decompressDelegatedBooking(bookingSlot.bookingDetail);

    debug('Unzipped successfully');

    const ageOfBooking = new DateTime(unzippedSlot.testSlot.slotDetail.start).daysDiff(todaysDate);

    debug('Age of booking:', ageOfBooking);

    return ageOfBooking > NUMBER_OF_DAYS_TO_RETAIN_CACHED_BOOKINGS;
  });
};
