import { handler } from '../handler';
import { APIGatewayEvent, Context } from 'aws-lambda';
import * as createResponse from '../../../../common/application/utils/createResponse';
import { It, Mock, Times } from 'typemoq';
import * as transferDatasets from '../../application/transfer-datasets';
import Response from '../../../../common/application/api/Response';
import * as config from '../../../../common/framework/config/config';
import { DdbTableTypes } from '../../../../common/application/utils/ddbTable';

const lambdaTestUtils = require('aws-lambda-test-utils');

describe('pollJournals handler', () => {
  let dummyApigwEvent: APIGatewayEvent;
  let dummyContext: Context;

  const moqConfigBootstrap = Mock.ofInstance(config.bootstrapConfig);
  const moqTransferDatasets = Mock.ofInstance(transferDatasets.transferDatasets);
  const moqCreateResponse = Mock.ofInstance(createResponse.default);

  const dummyStartTime = new Date();

  const moqResponse = Mock.ofType<Response>();

  beforeEach(() => {
    moqConfigBootstrap.reset();
    moqTransferDatasets.reset();
    moqCreateResponse.reset();
    moqResponse.reset();

    moqResponse.setup((x: any) => x.then).returns(() => undefined);

    dummyApigwEvent = lambdaTestUtils.mockEventCreator.createAPIGatewayEvent();
    dummyContext = lambdaTestUtils.mockContextCreator(() => null);

    moqCreateResponse.setup(x => x(It.isAny())).returns(() => moqResponse.object);
    moqCreateResponse.setup(x => x(It.isAny(), It.isAny())).returns(() => moqResponse.object);

    spyOn(config, 'bootstrapConfig').and.callFake(moqConfigBootstrap.object);
    spyOn(transferDatasets, 'transferDatasets').and.callFake(moqTransferDatasets.object);
    spyOn(createResponse, 'default').and.callFake(moqCreateResponse.object);
  });

  it('should bootstrap configuration, transferDatasets and return a blank response', async () => {
    const result = await handler(dummyApigwEvent, dummyContext);

    moqConfigBootstrap.verify(x => x(DdbTableTypes.JOURNALS), Times.once());
    moqTransferDatasets.verify(x => x(It.isAny()), Times.once());
    moqCreateResponse.verify(x => x(It.isValue({})), Times.once());
    expect(result).toBe(moqResponse.object);
  });

  it('should return an error response when a dependency throws an exception', async () => {
    dummyContext = lambdaTestUtils.mockContextCreator(() => null);

    moqTransferDatasets.setup(x => x(It.isAny())).throws(new Error('testError'));

    const result = await handler(dummyApigwEvent, dummyContext);

    moqCreateResponse.verify(x => x(It.isValue({}), It.isValue(500)), Times.once());
    expect(result).toBe(moqResponse.object);
  });

});
