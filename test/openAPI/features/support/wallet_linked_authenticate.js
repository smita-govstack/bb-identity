const chai = require('chai');
const { spec } = require('pactum');
const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const {
  localhost,
  contentTypeHeader,
  defaultExpectedResponseTime,
  walletGenerateLinkCodeEndpoint,
  X_XSRF_TOKEN,
  transactionId,
  walletLinkTransactionEndpoint,
  walletLinkedAuthenticateEndpoint,
  individualId,
  walletLinkedAuthenticateResponseSchema,
} = require('./helpers/helpers');

chai.use(require('chai-json-schema'));

let specWalletGenerateLinkCode;
let specWalletLinkTransaction;
let specWalletLinkedAuthenticate;
let receivedLinkedTransactionId;

const baseUrl = localhost + walletLinkedAuthenticateEndpoint;
const endpointTag = { tags: `@endpoint=/${walletLinkedAuthenticateEndpoint}` };

Before(endpointTag, () => {
  specWalletGenerateLinkCode = spec();
  specWalletLinkTransaction = spec();
  specWalletLinkedAuthenticate = spec();
});

// Scenario: Successfully checks the correctness of the data smoke type test
Given(
  'Wants to check the correctness of the data',
  () => 'Wants to check the correctness of the data'
);

Given(
  'The link code is generated before POST \\/linked-authorization\\/authenticate',
  async () => {
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

    specWalletLinkTransaction
      .post(localhost + walletLinkTransactionEndpoint)
      .withJson({
        requestTime: new Date().toISOString(),
        request: {
          linkCode: specWalletGenerateLinkCode._response.json.response.linkCode,
        },
      });

    await specWalletLinkTransaction.toss();
    receivedLinkedTransactionId =
      specWalletLinkTransaction._response.json.response.linkTransactionId;
  }
);

When(
  'Send POST \\/linked-authorization\\/authenticate request with given requestTime, linkedTransactionId, individualId, {string} as authFactorType, {string} as challenge, {string} as format',
  (authFactorType, challenge, format) =>
    specWalletLinkedAuthenticate.post(baseUrl).withJson({
      requestTime: new Date().toISOString(),
      request: {
        linkedTransactionId: receivedLinkedTransactionId,
        individualId: individualId,
        challengeList: [
          {
            authFactorType: authFactorType,
            challenge: challenge,
            format: format,
          },
        ],
      },
    })
);

Then(
  'Receive a response from the \\/linked-authorization\\/authenticate endpoint',
  async () => await specWalletLinkedAuthenticate.toss()
);

Then(
  'The \\/linked-authorization\\/authenticate endpoint response should be returned in a timely manner 15000ms',
  () =>
    specWalletLinkedAuthenticate
      .response()
      .to.have.responseTimeLessThan(defaultExpectedResponseTime)
);

Then(
  'The \\/linked-authorization\\/authenticate endpoint response should have status 200',
  () => specWalletLinkedAuthenticate.response().to.have.status(200)
);

Then(
  'The \\/linked-authorization\\/authenticate endpoint response should have content-type: application\\/json header',
  () =>
    specWalletLinkedAuthenticate
      .response()
      .should.have.header(contentTypeHeader.key, contentTypeHeader.value)
);

Then(
  'The \\/linked-authorization\\/authenticate endpoint response should contain linkedTransactionId',
  () =>
    chai
      .expect(
        specWalletLinkedAuthenticate._response.json.response.linkedTransactionId
      )
      .to.be.equal(receivedLinkedTransactionId)
);

Then(
  'The \\/linked-authorization\\/authenticate endpoint response should match json schema without errors',
  () => {
    chai.expect(specWalletLinkedAuthenticate._response.json.errors).to.be.empty;
  }
);

// Scenario: Not able to check the correctness of the data because of an invalid linkedTransactionId
// Given and others Then for this scenario are written in the aforementioned example
When(
  'Send POST \\/linked-authorization\\/authenticate request with given invalid linkedTransactionId',
  () =>
    specWalletLinkedAuthenticate.post(baseUrl).withJson({
      requestTime: new Date().toISOString(),
      request: {
        linkedTransactionId: 'invalid_linked_transaction_id',
        individualId: individualId,
        challengeList: [
          {
            authFactorType: 'PIN',
            challenge: 'password',
            format: 'alpha-numeric',
          },
        ],
      },
    })
);

Then(
  'The \\/linked-authorization\\/authenticate endpoint response should match json schema',
  () =>
    chai
      .expect(specWalletLinkedAuthenticate._response.json)
      .to.be.jsonSchema(walletLinkedAuthenticateResponseSchema)
);

Then(
  'The \\/linked-authorization\\/authenticate response should contain errorCode property equals to {string}',
  (errorCode) =>
    chai
      .expect(
        specWalletLinkedAuthenticate._response.json.errors
          .map((error) => error.errorCode)
          .toString()
      )
      .to.be.equal(errorCode)
);

// Scenario: Not able to check the correctness of the data because of an invalid individualId
// Given and others Then for this scenario are written in the aforementioned example
When(
  'Send POST \\/linked-authorization\\/authenticate request with given invalid individualId',
  () =>
    specWalletLinkedAuthenticate.post(baseUrl).withJson({
      requestTime: new Date().toISOString(),
      request: {
        linkedTransactionId: receivedLinkedTransactionId,
        individualId: null,
        challengeList: [
          {
            authFactorType: 'PIN',
            challenge: 'password',
            format: 'alpha-numeric',
          },
        ],
      },
    })
);

When(
  'Send POST \\/linked-authorization\\/authenticate request with given invalid challengeList',
  () =>
    specWalletLinkedAuthenticate.post(baseUrl).withJson({
      requestTime: new Date().toISOString(),
      request: {
        linkedTransactionId: receivedLinkedTransactionId,
        individualId: individualId,
        challengeList: [],
      },
    })
);

After(endpointTag, () => {
  specWalletGenerateLinkCode.end();
  specWalletLinkTransaction.end();
  specWalletLinkedAuthenticate.end();
});
