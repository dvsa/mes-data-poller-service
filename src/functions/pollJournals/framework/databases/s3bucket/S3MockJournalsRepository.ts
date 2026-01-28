import {GetObjectCommand, NoSuchKey, S3Client, S3ServiceException} from '@aws-sdk/client-s3';
import { error, info } from '@dvsa/mes-microservice-common/application/utils/logger';

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

export const getMockJournalData = async (staffNumber: string, fileName: string): Promise<any | null> => {
  const params = {
    Bucket: 'mes-andys-bucket',
    Key: `journals/${staffNumber}/${fileName}.json`,
  };
  info('params established', params);
  try {
    info('Getting mock journal from s3', params);
    const client = createS3Client();
    info('client created');

    const response = await client.send(new GetObjectCommand(params));
    info('request sent');
    info('response received', response.Body);
    if (response.Body) {
      info('got response for', staffNumber, response.Body);
      const stringResponse = await response.Body.transformToString();
      if (stringResponse) {
        info('string response for', staffNumber, stringResponse);
        return JSON.parse(stringResponse);
      }
    }
    info('no valid response for', staffNumber);
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
