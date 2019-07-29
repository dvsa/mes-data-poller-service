import {
  uncacheStaffNumbers, cacheStaffDetails,
} from '../framework/repo/dynamodb/cached-examiner-repository';
import { StaffDetail, TestPermissionPeriod } from '../../../common/application/models/staff-details';
import { isEqual } from 'lodash';

export const reconcileActiveAndCachedExaminers = async (
  activeStaffDetails: StaffDetail[],
  cachedStaffDetails: StaffDetail[],
) => {
  const activeStaffNumbers = activeStaffDetails.map(staffDetail => staffDetail.staffNumber);
  const cachedStaffNumbers = cachedStaffDetails.map(staffDetail => staffDetail.staffNumber);

  const staffDetailsToCache = selectStaffDetailsToCache(activeStaffDetails, cachedStaffDetails);
  await cacheStaffDetails(staffDetailsToCache);

  const staffNumbersToUncache = cachedStaffNumbers.filter(staffNumber => !activeStaffNumbers.includes(staffNumber));
  await uncacheStaffNumbers(staffNumbersToUncache);
};

const selectStaffDetailsToCache = (
  activeStaffDetails: StaffDetail[],
  cachedStaffDetails: StaffDetail[],
): StaffDetail[] => {
  return activeStaffDetails
    .filter(activeStaffDetail => staffDetailEligibleForCache(activeStaffDetail, cachedStaffDetails));
};

const staffDetailEligibleForCache = (staffDetail: StaffDetail, cachedStaffDetails: StaffDetail[]): boolean => {
  const oldStaffDetailForExaminer = cachedStaffDetails
    .find(cachedStaffDetail => cachedStaffDetail.staffNumber === staffDetail.staffNumber);

  // Examiner not in cache already, allow through filter
  if (!oldStaffDetailForExaminer) {
    return true;
  }

  // Simple isEqual comparision won't work here, probably because of differing prototypes
  return !staffDetailIsEqual(staffDetail, oldStaffDetailForExaminer);
};

const staffDetailIsEqual = (sd1: StaffDetail, sd2: StaffDetail): boolean => {
  return sd1.staffNumber === sd2.staffNumber
    && sd1.role === sd2.role
    && testPermissionPeriodsMatch(sd1.testPermissionPeriods, sd2.testPermissionPeriods);
};

const testPermissionPeriodsMatch = (tp1: TestPermissionPeriod[], tp2: TestPermissionPeriod[]): boolean => {
  let allMatch = true;
  for (const compareFromPeriod of tp1) {
    if (tp2.find(compareToPeriod => isEqual(compareToPeriod, compareFromPeriod)) === undefined) {
      allMatch = false;
      break;
    }
  }
  return allMatch;
};
