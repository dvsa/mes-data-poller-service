import { advanceTestSlotsIntegrationTests } from '../mysql/__tests__/advance-test-slot-repository.int.module';
import { personalCommitmentIntegrationTests } from '../mysql/__tests__/personal-commitment-repository.int.module';
import { dynamoDBIntegrationTests } from '../dynamodb/__tests__/journal-repository.int.module';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 3 * 60 * 1000;

describe('Repository integration tests', () => {

  describe('MySQL repositories suites', () => {
    personalCommitmentIntegrationTests();
    advanceTestSlotsIntegrationTests();
  });

  describe('DynamoDB repositories suites', () => {
    dynamoDBIntegrationTests();
  });
});
