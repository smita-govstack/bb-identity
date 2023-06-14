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
  walletGenerateLinkCodeResponseSchema,
  walletLinkTransactionEndpoint,
  walletGenerateLinkAuthCodeEndpoint,
  walletConsentEndpoint,
} = require('./helpers/helpers');

chai.use(require('chai-json-schema'));

let specWalletGenerateLinkCode;
let specWalletLinkTransaction;
let specWalletGenerateLinkAuthCode;
let specWalletConsent;
let specWalletGenerateLinkCodeReusad;

const baseUrl = localhost + walletGenerateLinkCodeEndpoint;
const endpointTag = { tags: `@endpoint=/${walletGenerateLinkCodeEndpoint}` };

Before(endpointTag, () => {
  specWalletGenerateLinkCode = spec();
  specWalletLinkTransaction = spec();
  specWalletGenerateLinkAuthCode = spec();
  specWalletConsent = spec();
  specWalletGenerateLinkCodeReusad = spec();
});

// Scenario: Successfully generates link code smoke type test
Given('Wants to generate link code', () => 'Wants to generate link code');

When(
  'Send POST \\/linked-authorization\\/link-code request with given X-XSRF-TOKEN header, transactionId and requestTime',
  () =>
    specWalletGenerateLinkCode
      .post(baseUrl)
      .withHeaders(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
      .withCookies(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
      .withJson({
        requestTime: new Date().toISOString(),
        request: {
          transactionId: transactionId,
        },
      })
);

Then(
  'Receive a response from the \\/linked-authorization\\/link-code endpoint',
  async () => await specWalletGenerateLinkCode.toss()
);

Then(
  'The \\/linked-authorization\\/link-code endpoint response should be returned in a timely manner 15000ms',
  () =>
    specWalletGenerateLinkCode
      .response()
      .to.have.responseTimeLessThan(defaultExpectedResponseTime)
);

Then(
  'The \\/linked-authorization\\/link-code endpoint response should have status 200',
  () => specWalletGenerateLinkCode.response().to.have.status(200)
);

Then(
  'The \\/linked-authorization\\/link-code endpoint response should have content-type: application\\/json header',
  () =>
    specWalletGenerateLinkCode
      .response()
      .should.have.header(contentTypeHeader.key, contentTypeHeader.value)
);

Then(
  'The \\/linked-authorization\\/link-code endpoint response should match json schema with no errors',
  () => {
    chai
      .expect(specWalletGenerateLinkCode._response.json)
      .to.be.jsonSchema(walletGenerateLinkCodeResponseSchema);
    chai.expect(specWalletGenerateLinkCode._response.json.errors).to.be.empty;
  }
);

Then(
  'The \\/linked-authorization\\/link-code response should contain transactionId property equals provided transactionId',
  () =>
    chai
      .expect(specWalletGenerateLinkCode._response.json.response.transactionId)
      .to.be.equal(transactionId)
);

// Scenario: Not able to generate link code because of a random transaction_id
// Given and others Then for this scenario are written in the aforementioned example
When(
  'Send POST \\/linked-authorization\\/link-code request with given X-XSRF-TOKEN header, random transactionId and requestTime',
  () =>
    specWalletGenerateLinkCode
      .post(baseUrl)
      .withHeaders(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
      .withCookies(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
      .withJson({
        requestTime: new Date().toISOString(),
        request: {
          transactionId: 'random-transaction-id',
        },
      })
);

Then(
  'The \\/linked-authorization\\/link-code endpoint response should match json schema with errors',
  () => {
    chai
      .expect(specWalletGenerateLinkCode._response.json)
      .to.be.jsonSchema(walletGenerateLinkCodeResponseSchema);
    chai.expect(specWalletGenerateLinkCode._response.json.errors).to.not.be
      .empty;
  }
);

Then(
  'The \\/linked-authorization\\/link-code response should contain errorCode property equals to {string}',
  (errorCode) =>
    chai
      .expect(
        specWalletGenerateLinkCode._response.json.errors
          .map((error) => error.errorCode)
          .toString()
      )
      .to.be.equal(errorCode)
);

// Scenario: Not able to generate link code because of a blank transaction_id
// Given and others Then for this scenario are written in the aforementioned example
When(
  'Send POST \\/linked-authorization\\/link-code request with given X-XSRF-TOKEN header, blank transactionId and requestTime',
  () =>
    specWalletGenerateLinkCode
      .post(baseUrl)
      .withHeaders(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
      .withCookies(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
      .withJson({
        requestTime: new Date().toISOString(),
        request: {
          transactionId: '',
        },
      })
);

// Scenario: Not able to generate link code because of reause of the completed transaction_id
// Given and others Then for this scenario are written in the aforementioned example
Given('The first authorization flow for transactionId ends', async () => {
  specWalletGenerateLinkCode
    .post(baseUrl)
    .withHeaders(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
    .withCookies(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
    .withJson({
      requestTime: new Date().toISOString(),
      request: {
        transactionId: 'transaction_id_003',
      },
    });

  await specWalletGenerateLinkCode.toss();

  await specWalletLinkTransaction
    .post(localhost + walletLinkTransactionEndpoint)
    .withJson({
      requestTime: new Date().toISOString(),
      request: {
        linkCode: specWalletGenerateLinkCode._response.json.response.linkCode,
      },
    });

  await specWalletLinkTransaction.toss();

  await specWalletConsent.post(localhost + walletConsentEndpoint).withJson({
    requestTime: new Date().toISOString(),
    request: {
      linkedTransactionId:
        specWalletLinkTransaction._response.json.response.linkTransactionId,
    },
  });

  await specWalletGenerateLinkAuthCode
    .post(localhost + walletGenerateLinkAuthCodeEndpoint)
    .withHeaders(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
    .withJson({
      requestTime: new Date().toISOString(),
      request: {
        linkedCode: specWalletGenerateLinkCode._response.json.response.linkCode,
        transactionId: 'transaction_id_003',
      },
    });
});

When(
  'Send POST \\/linked-authorization\\/link-code request with given X-XSRF-TOKEN header, reaused completed transactionId and requestTime',
  () =>
    specWalletGenerateLinkCodeReusad
      .post(baseUrl)
      .withHeaders(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
      .withCookies(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
      .withJson({
        requestTime: new Date().toISOString(),
        request: {
          transactionId: 'transaction_id_003',
        },
      })
);

Then(
  'Receive a response for completed transactionId from the \\/linked-authorization\\/link-code endpoint',
  async () => await specWalletGenerateLinkCodeReusad.toss()
);

Then(
  'The \\/linked-authorization\\/link-code endpoint response for completed transactionId should have status 200',
  () => specWalletGenerateLinkCodeReusad.response().to.have.status(200)
);

Then(
  'The \\/linked-authorization\\/link-code endpoint response for completed transactionId should have content-type: application\\/json header',
  () =>
    specWalletGenerateLinkCodeReusad
      .response()
      .should.have.header(contentTypeHeader.key, contentTypeHeader.value)
);

Then(
  'The \\/linked-authorization\\/link-code endpoint response for completed transactionId should match json schema with errors',
  () => {
    chai
      .expect(specWalletGenerateLinkCodeReusad._response.json)
      .to.be.jsonSchema(walletGenerateLinkCodeResponseSchema);
    chai.expect(specWalletGenerateLinkCodeReusad._response.json.errors).to.not
      .be.empty;
  }
);

Then(
  'The \\/linked-authorization\\/link-code response for completed transactionId should contain errorCode property equals to {string}',
  (errorCode) =>
    chai
      .expect(
        specWalletGenerateLinkCodeReusad._response.json.errors
          .map((error) => error.errorCode)
          .toString()
      )
      .to.be.equal(errorCode)
);

// Scenario: Not able to generate link code because of invalid requestTime
// Given and others Then for this scenario are written in the aforementioned example
When(
  'Send POST \\/linked-authorization\\/link-code request with given X-XSRF-TOKEN header, transactionId and invalid requestTime',
  () =>
    specWalletGenerateLinkCode
      .post(baseUrl)
      .withHeaders(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
      .withCookies(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
      .withJson({
        requestTime: null,
        request: {
          transactionId: transactionId,
        },
      })
);

// Scenario: Not able to generate link code because of invalid xsrf token
// Given and others Then for this scenario are written in the aforementioned example
When(
  'Send POST \\/linked-authorization\\/link-code request with given invalid X-XSRF-TOKEN header, transactionId and requestTime',
  () =>
    specWalletGenerateLinkCode
      .post(baseUrl)
      .withHeaders(X_XSRF_TOKEN.key, 'invalid value')
      .withCookies(X_XSRF_TOKEN.key, 'invalid value')
      .withJson({
        requestTime: new Date().toISOString(),
        request: {
          transactionId: transactionId,
        },
      })
);

Then(
  'The \\/linked-authorization\\/link-code endpoint response should have status 403',
  () => specWalletGenerateLinkCode.response().to.have.status(403)
);

After(endpointTag, () => {
  specWalletGenerateLinkCode.end();
  specWalletLinkTransaction.end();
  specWalletGenerateLinkAuthCode.end();
  specWalletConsent.end();
  specWalletGenerateLinkCodeReusad.end();
});
