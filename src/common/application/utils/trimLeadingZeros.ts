export const trimLeadingZeroes = (staffNumber: string): string | null => {
  const numericStaffNumber = Number.parseInt(staffNumber, 10);
  if (Number.isNaN(numericStaffNumber)) {
    return null;
  }
  return numericStaffNumber.toString();
};
