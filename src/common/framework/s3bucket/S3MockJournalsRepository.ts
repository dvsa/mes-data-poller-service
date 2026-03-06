import { debug, error, info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { GetObjectCommand, GetObjectCommandInput, NoSuchKey, S3Client, S3ServiceException } from '@aws-sdk/client-s3';
import { addDays, subDays, format } from 'date-fns';
import { config } from '../config/config';
import {
  UniversalPermissionRecord,
} from '../../../functions/pollUsers/framework/repositories/get-universal-permissions';
import { ExaminerQueryRecord } from '../../application/models/examiner-details';
import { ExaminerRecord } from '../../../functions/pollJournals/domain/examiner-record';
import { TestCentreRow } from '../../application/models/test-centre-journal';
import {
  DelegatedTestSlotRow,
} from '../../../functions/pollDelegatedBookings/framework/repo/mysql/delegated-examiner-bookings-repository';

/**
 * Creates a client to interact with an S3 bucket
 */
const createS3Client = (): S3Client => {
  try {
    return new S3Client({
      region: 'eu-west-1',
    });
  } catch (err) {
    error('Error creating S3 client', err);
    throw err;
  }
};

/**
 * Recursively replaces all dynamic dates with actual dates
 */
export function replaceTodayPlaceholders(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(replaceTodayPlaceholders);
  } else if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, replaceTodayPlaceholders(value)]),
    );
  } else if (typeof obj === 'string') {
    // Match <TODAY>, <TODAY+n>, <TODAY-n>
    const match = obj.match(/^<TODAY(?:(\+|-)(\d+))?>T(\d{2}:\d{2}:\d{2})$/);
    if (match) {
      const [, sign, offsetStr, time] = match;
      const offset = offsetStr ? parseInt(offsetStr, 10) : 0;
      let date = new Date();
      if (sign === '+') {
        date = addDays(date, offset);
      } else if (sign === '-') date = subDays(date, offset);
      // Set time
      const [hours, minutes, seconds] = time.split(':').map(Number);
      date.setHours(hours, minutes, seconds, 0);
      return format(date, 'yyyy-MM-dd\'T\'HH:mm:ss');
    }
    return obj;
  }
  return obj;
}

/**
 * Get mock journal data from an S3 bucket
 * @param staffNumber the user's staff number
 * @param fileName the name of the file to retrieve
 */
export const getMockJournalData = async (staffNumber: string, fileName: string): Promise<any | null> => {
  const params = {
    Bucket: config().s3BucketName,
    Key: `journals/${staffNumber}/${fileName}.json`,
  };
  info('params established', params);
  return replaceTodayPlaceholders(await getDataFromBucket(params));
};

export const getMockUniversalPermissions = async (): Promise<UniversalPermissionRecord[] | null> => {
  const params = {
    Bucket: config().s3BucketName,
    Key: 'universal-test-permissions.json',
  };
  info('params established', params);
  const examinersInBucket = await getDataFromBucket(params);
  if (examinersInBucket) {
    return examinersInBucket.map((examiner) => {
      return {
        ...examiner,
        with_effect_from: new Date(examiner.with_effect_from),
        with_effect_to: examiner.with_effect_to ? new Date(examiner.with_effect_to) : null,
      };
    });
  }
};

export const getMockActiveExaminers = async (): Promise<ExaminerQueryRecord[] | null> => {
  const params = {
    Bucket: config().s3BucketName,
    Key: 'active-examiners.json',
  };
  info('params established', params);
  const examinersInBucket = await getDataFromBucket(params);
  if (examinersInBucket) {
    return examinersInBucket.map((examiner) => {
      return {
        ...examiner,
        with_effect_from: examiner.with_effect_from ? new Date(examiner.with_effect_from) : null,
        with_effect_to: examiner.with_effect_to ? new Date(examiner.with_effect_to) : null,
      };
    });
  }
  return null;
};

export const getMockDelegatedBookings = async (): Promise<DelegatedTestSlotRow[] | null> => {
  const params = {
    Bucket: config().s3BucketName,
    Key: 'delegated-bookings.json',
  };
  info('params established', params);
  return replaceTodayPlaceholders(await getDataFromBucket(params));
};

export const getMockTestCentreExaminers = async (): Promise<TestCentreRow[] | null> => {
  const params = {
    Bucket: config().s3BucketName,
    Key: 'test-centre-examiners.json',
  };
  debug('params established', params);
  return await getDataFromBucket(params);
};

/**
 * Get mock user data from an S3 bucket
 */
export const getMockUserData = async (): Promise<ExaminerRecord[] | null> => {
  const params = {
    Bucket: config().s3BucketName,
    Key: 'users.json',
  };
  debug('params established', params);
  return await getDataFromBucket(params);
};

/**
 * Get data from an S3 bucket via GetObjectCommand
 * @param params the GetObjectCommandInput parameters for the bucket
 */
export const getDataFromBucket = async (params: GetObjectCommandInput): Promise<any | null> => {
  try {
    debug('Getting mock journal from s3', params);
    const client = createS3Client();
    const response = await client.send(new GetObjectCommand(params));
    if (response?.Body) {
      debug('got response for', params);
      const stringResponse = await response.Body.transformToString();
      if (stringResponse) {
        return JSON.parse(stringResponse);
      }
    }
    debug('no valid response for', params);
    return null;
  } catch (caught) {
    if (caught instanceof NoSuchKey) {
      error(
        `Error from S3 while getting object "${params.Key}" from "${params.Bucket}". No such key exists.`,
      );
    } else if (caught instanceof S3ServiceException) {
      error(
        `Error from S3 while getting object from ${params.Bucket}.  ${caught.name}: ${caught.message}`,
      );
    } else {
      error(
        `Error from S3 ${params.Bucket}.  ${caught.name}: ${caught.message}`,
      );
    }
    return null;
  }
};
