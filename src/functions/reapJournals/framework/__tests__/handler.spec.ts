import { handler } from '../handler';
import { APIGatewayEvent, Context } from 'aws-lambda';
import * as createResponse from '../../../../common/application/utils/createResponse';
import { It, Mock, Times } from 'typemoq';
import * as GetInactiveExaminers from '../../framework/repositories/get-inactive-examiners';
import Response from '../../../../common/application/api/Response';
import * as config from '../../../../common/framework/config/config';
import { DdbTableTypes } from '../../../../common/application/utils/ddbTable';

const lambdaTestUtils = require('aws-lambda-test-utils');

describe('reapJournals handler', () => {
  let dummyApigwEvent: APIGatewayEvent;
  let dummyContext: Context;

  const moqConfigBootstrap = Mock.ofInstance(config.bootstrapReapJournalsConfig);
  const moqGetInactiveExaminers = Mock.ofInstance(GetInactiveExaminers.getInactiveExaminers);
  const moqCreateResponse = Mock.ofInstance(createResponse.default);

  const moqResponse = Mock.ofType<Response>();

  beforeEach(() => {
    moqConfigBootstrap.reset();
    moqCreateResponse.reset();
    moqResponse.reset();

    moqResponse.setup((x: any) => x.then).returns(() => undefined);

    dummyApigwEvent = lambdaTestUtils.mockEventCreator.createAPIGatewayEvent();
    dummyContext = lambdaTestUtils.mockContextCreator(() => null);

    moqCreateResponse.setup(x => x(It.isAny())).returns(() => moqResponse.object);
    moqCreateResponse.setup(x => x(It.isAny(), It.isAny())).returns(() => moqResponse.object);

    spyOn(config, 'bootstrapReapJournalsConfig').and.callFake(moqConfigBootstrap.object);
    spyOn(GetInactiveExaminers, 'getInactiveExaminers').and.callFake(moqGetInactiveExaminers.object);
    spyOn(createResponse, 'default').and.callFake(moqCreateResponse.object);
  });

  it('should bootstrap configuration, call getInactiveExaminers and return a blank response', async () => {
    await handler(dummyApigwEvent, dummyContext);

    moqConfigBootstrap.verify(x => x(DdbTableTypes.JOURNALS), Times.once());
    moqGetInactiveExaminers.verify(x => x(), Times.once());
    moqCreateResponse.verify(x => x(It.isValue({})), Times.once());
  });

});

