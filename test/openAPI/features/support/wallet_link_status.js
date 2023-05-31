const chai = require('chai');
const { spec } = require('pactum');
const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const {
  localhost,
  contentTypeHeader,
  walletGenerateLinkCodeEndpoint,
  X_XSRF_TOKEN,
  transactionId,
  walletLiskStatusResponseSchema,
  walletLinkStatusEndpoint,
  walletLinkStatusExpectedResponseTime,
} = require('./helpers/helpers');

chai.use(require('chai-json-schema'));

let specWalletLinkStatus;
let specWalletGenerateLinkCode;
let recivedLinkCode;

const baseUrl = localhost + walletLinkStatusEndpoint;
const endpointTag = { tags: `@endpoint=/${walletLinkStatusEndpoint}` };

Before(endpointTag, () => {
  specWalletGenerateLinkCode = spec();
  specWalletLinkStatus = spec();
});

// Scenario: Successfully checks the status of link code smoke type test
Given(
  'Wants to check the status of link code',
  () => 'Wants to check the status of link code'
);

Given('The link code is generated', async () => {
  specWalletGenerateLinkCode
    .post(localhost + walletGenerateLinkCodeEndpoint)
    .withHeaders(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
    .withJson({
      requestTime: new Date().toISOString(),
      request: {
        transactionId: transactionId,
      },
    });
  await specWalletGenerateLinkCode.toss();
  recivedLinkCode = specWalletGenerateLinkCode._response.json.response.linkCode;
});

When(
  'Send POST \\/linked-authorization\\/link-status request with given X-XSRF-TOKEN header, transactionId, linkCode and requestTime',
  () =>
    specWalletLinkStatus
      .post(baseUrl)
      .withHeaders(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
      .withJson({
        requestTime: new Date().toISOString(),
        request: {
          transactionId: transactionId,
          linkCode: recivedLinkCode,
        },
      })
);

Then(
  'Receive a response from the \\/linked-authorization\\/link-status endpoint',
  async () => await specWalletLinkStatus.toss()
);

Then(
  'The \\/linked-authorization\\/link-status endpoint response should be returned in a timely manner 25000ms',
  () =>
    specWalletLinkStatus
      .response()
      .to.have.responseTimeLessThan(walletLinkStatusExpectedResponseTime)
);

Then(
  'The \\/linked-authorization\\/link-status endpoint response should have status 200',
  () => specWalletLinkStatus.response().to.have.status(200)
);

Then(
  'The \\/linked-authorization\\/link-status endpoint response should have content-type: application\\/json header',
  () =>
    specWalletLinkStatus
      .response()
      .should.have.header(contentTypeHeader.key, contentTypeHeader.value)
);

Then(
  'The \\/linked-authorization\\/link-status endpoint response should match json schema with no errors',
  () => {
    chai
      .expect(specWalletLinkStatus._response.json)
      .to.be.jsonSchema(walletLiskStatusResponseSchema);
    chai.expect(specWalletLinkStatus._response.json.errors).to.be.empty;
  }
);

Then(
  'The \\/linked-authorization\\/link-status response should contain transactionId property equals provided transactionId',
  () =>
    chai
      .expect(specWalletLinkStatus._response.json.response.transactionId)
      .to.be.equal(transactionId)
);

// Scenario: Not able to check the status of link code because of the blank transactionId
// Given and others Then for this scenario are written in the aforementioned example
When(
  'Send POST \\/linked-authorization\\/link-status request with given X-XSRF-TOKEN header, blank transactionId, linkCode and requestTime',
  () =>
    specWalletLinkStatus
      .post(baseUrl)
      .withHeaders(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
      .withJson({
        requestTime: new Date().toISOString(),
        request: {
          transactionId: '',
          linkCode: recivedLinkCode,
        },
      })
);

Then(
  'The \\/linked-authorization\\/link-status endpoint response should match json schema with errors',
  () => {
    chai
      .expect(specWalletLinkStatus._response.json)
      .to.be.jsonSchema(walletLiskStatusResponseSchema);
    chai.expect(specWalletLinkStatus._response.json.errors).to.not.be.empty;
  }
);

Then(
  'The \\/linked-authorization\\/link-status response should contain errorCode property equals to {string}',
  (errorCode) =>
    chai
      .expect(
        specWalletLinkStatus._response.json.errors
          .map((error) => error.errorCode)
          .toString()
      )
      .to.be.equal(errorCode)
);

// Scenario: Not able to check the status of link code because of the random transactionId
// Given and others Then for this scenario are written in the aforementioned example
When(
  'Send POST \\/linked-authorization\\/link-status request with given X-XSRF-TOKEN header, random transactionId, linkCode and requestTime',
  () =>
    specWalletLinkStatus
      .post(baseUrl)
      .withHeaders(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
      .withJson({
        requestTime: new Date().toISOString(),
        request: {
          transactionId: 'random-transaction-id',
          linkCode: recivedLinkCode,
        },
      })
);

// Scenario: Not able to check the status of link code because of the completed transactionId
// Given and others Then for this scenario are written in the aforementioned example
When(
  'Send POST \\/linked-authorization\\/link-status request with given X-XSRF-TOKEN header, completed transactionId, linkCode and requestTime',
  () =>
    specWalletLinkStatus
      .post(baseUrl)
      .withHeaders(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
      .withJson({
        requestTime: new Date().toISOString(),
        request: {
          transactionId: 'completed-transaction-id',
          linkCode: recivedLinkCode,
        },
      })
);

// Scenario: Not able to check the status of link code because of the random linkCode
// Given and others Then for this scenario are written in the aforementioned example
When(
  'Send POST \\/linked-authorization\\/link-status request with given X-XSRF-TOKEN header, transactionId, random linkCode and requestTime',
  () =>
    specWalletLinkStatus
      .post(baseUrl)
      .withHeaders(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
      .withJson({
        requestTime: new Date().toISOString(),
        request: {
          transactionId: transactionId,
          linkCode: 'invalid_link_code',
        },
      })
);

// Scenario: Not able to check the status of link code because of the blank linkCode
// Given and others Then for this scenario are written in the aforementioned example
When(
  'Send POST \\/linked-authorization\\/link-status request with given X-XSRF-TOKEN header, transactionId, blank linkCode and requestTime',
  () =>
    specWalletLinkStatus
      .post(baseUrl)
      .withHeaders(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
      .withJson({
        requestTime: new Date().toISOString(),
        request: {
          transactionId: transactionId,
          linkCode: '',
        },
      })
);

After(endpointTag, () => {
  specWalletGenerateLinkCode.end();
  specWalletLinkStatus.end();
});
