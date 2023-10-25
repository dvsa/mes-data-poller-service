// import { handler } from '../handler';
// import { APIGatewayProxyEvent, Context } from 'aws-lambda';
// import { Mock, Times, It } from 'typemoq';
//
// const lambdaTestUtils = require('aws-lambda-test-utils');
// import * as transferUsers from '../../domain/transfer-users';
// import * as createResponse from '../../../../common/application/utils/createResponse';
// import Response from '../../../../common/application/api/Response';
// import { HttpStatus } from '../../../../common/application/api/HttpStatus';
//
// describe('pollUsers handler', () => {
//   let dummyEvent: APIGatewayProxyEvent;
//   let dummyContext: Context;
//   const moqConfigBootstrap = Mock.ofInstance(config.bootstrapConfig);
//   const moqTransferUsers = Mock.ofInstance(transferUsers.transferUsers);
//   const moqCreateResponse = Mock.ofInstance(createResponse.default);
//
//   const moqResponse = Mock.ofType<Response>();
//
//   beforeEach(() => {
//     moqConfigBootstrap.reset();
//     moqTransferUsers.reset();
//     moqCreateResponse.reset();
//     moqResponse.reset();
//
//     dummyEvent = lambdaTestUtils.mockEventCreator.createAPIGatewayEvent();
//     dummyContext = lambdaTestUtils.mockContextCreator(() => null);
//
//     moqResponse.setup((x: any) => x.then).returns(() => undefined);
//
//     spyOn(config, 'bootstrapConfig').and.callFake(moqConfigBootstrap.object);
//     spyOn(transferUsers, 'transferUsers').and.callFake(moqTransferUsers.object);
//     spyOn(createResponse, 'default').and.callFake(moqCreateResponse.object);
//
//     moqCreateResponse.setup(x => x(It.isAny())).returns(() => moqResponse.object);
//     moqCreateResponse.setup(x => x(It.isAny(), It.isAny())).returns(() => moqResponse.object);
//   });
//
//   it('should bootstrap configuration, call transferUsers and return a response with no error', async () => {
//     const result = await handler(dummyEvent, dummyContext);
//
//     moqConfigBootstrap.verify(x => x(), Times.once());
//     moqTransferUsers.verify(x => x(), Times.once());
//     moqCreateResponse.verify(x => x(It.isValue({})), Times.once());
//     expect(result).toBe(moqResponse.object);
//   });
//
//   it('should create and return an internal server error response ' +
//         'when the configBootstrap throws an error', async () => {
//     moqConfigBootstrap.setup(x => x()).throws(new Error('AWS down'));
//
//     const result = await handler(dummyEvent, dummyContext);
//
//     expect(result).toBe(moqResponse.object);
//     moqCreateResponse.verify(x => x(It.isValue({}), It.isValue(HttpStatus.INTERNAL_SERVER_ERROR)), Times.once());
//   });
//
//   it('should create and return an internal server error response ' +
//         'when the user transfer throws an error', async () => {
//     moqTransferUsers.setup(x => x()).throws(new Error('MySQL down'));
//
//     const result = await handler(dummyEvent, dummyContext);
//
//     expect(result).toBe(moqResponse.object);
//     moqCreateResponse.verify(x => x(It.isValue({}), It.isValue(HttpStatus.INTERNAL_SERVER_ERROR)), Times.once());
//   });
// });
