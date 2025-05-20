import { info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { identifyInactiveJournals, removeInactiveJournals } from '../databases/dynamodb/journal-repository';

export const getInactiveExaminers = async () => {
  info(`STARTING INACTIVE EXAMINERS CLEANUP: ${new Date()}`);

  const inactiveStaffNumbers = await identifyInactiveJournals();
  await removeInactiveJournals(inactiveStaffNumbers);

  info(`FINISHED INACTIVE EXAMINERS CLEANUP: ${new Date()}`);
};
