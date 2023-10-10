import moment from 'moment';

export const formatDateToStartTime = (date: Date): string => {
  if (!date) {
    return '';
  }
  return moment(date).format('YYYY-MM-DDTHH:mm:ss');
};

export const formatDateToIso8601 = (date: Date): string => {
  if (!date) {
    return '';
  }
  return moment(date).format('YYYY-MM-DD');
};

export const extractTimeFromDateTime = (date: Date): string => {
  return moment(date).format('HH:mm:ss');
};

export const extractDateFromDateTime = (date: Date): string => {
  return moment(date).format('DD/MM/YYYY');
};
