import { startSlsOffline } from './spec/helpers/integration-test-lifecycle';

process.env.NODE_ENV = 'local';
startSlsOffline().then(() => {
  console.log('dynamoDb started');
  process.exit(0);
});
