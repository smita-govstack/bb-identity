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
  walletGenerateLinkAuthCodeResponseSchema,
  walletGenerateLinkAuthCodeEndpoint,
  individualId,
  walletLinkedAuthenticateEndpoint,
  walletLinkTransactionEndpoint
} = require('./helpers/helpers');

chai.use(require('chai-json-schema'));

let specWalletGenerateLinkCode;
let specWalletGenerateLinkAuthCode;
let specWalletGenerateLinkAuthCodeReusable;
let specWalletLinkTransaction;
let specWalletLinkedAuthenticate;
let receivedLinkCode;
let receivedLinkedTransactionId;

const baseUrl = localhost + walletGenerateLinkAuthCodeEndpoint;
const endpointTag = { tags: `@endpoint=/${walletGenerateLinkAuthCodeEndpoint}` };

Before(endpointTag, () => {
  specWalletGenerateLinkAuthCode = spec();
  specWalletGenerateLinkAuthCodeReusable = spec();
  specWalletGenerateLinkCode = spec();
  specWalletLinkTransaction = spec();
  specWalletLinkedAuthenticate = spec();
});

// Scenario: Successfully validates the link-code and its expiry and generates the link auth code smoke type test
Given(
    'Wants to validate the link-auth-code and generate the auth code',
    () =>
        'Wants to validate the link-auth-code and generate the auth code'
);

Given(
    /^The link code, transaction and authenticate is completed before POST \/linked\-authorization\/link\-auth\-code$/,
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

      receivedLinkCode =
          specWalletGenerateLinkCode._response.json.response.linkCode;

      specWalletLinkTransaction
        .post(localhost + walletLinkTransactionEndpoint)
        .withJson({
          requestTime: new Date().toISOString(),
          request: {
            linkCode: receivedLinkCode,
          },
        });

      await specWalletLinkTransaction.toss();

      receivedLinkedTransactionId =
          specWalletLinkTransaction._response.json.response.linkTransactionId;

      specWalletLinkedAuthenticate.post(localhost + walletLinkedAuthenticateEndpoint)
        .withJson({
          requestTime: new Date().toISOString(),
          request: {
            linkedTransactionId: receivedLinkedTransactionId,
            individualId: individualId,
            challengeList: [
              {
                authFactorType: "PIN",
                challenge: "password",
                format: "alpha-numeric",
              },
            ],
          },
        })

      await specWalletLinkedAuthenticate.toss();
    }
);

When(
    /^Send POST \/linked\-authorization\/link\-auth\-code request with given linkCode and transactionId$/,
    () =>
        specWalletGenerateLinkAuthCode.post(baseUrl)
          .withHeaders(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
          .withJson({
          requestTime: new Date().toISOString(),
          request: {
            linkedCode: receivedLinkCode,
            transactionId: transactionId
          },
        })
);

Then(
    /^Receive a response from the \/linked\-authorization\/link\-auth\-code endpoint$/,
    async () => await specWalletGenerateLinkAuthCode.toss()
);

Then(
    /^The \/linked\-authorization\/link\-auth\-code endpoint response should be returned in a timely manner 15000ms$/,
    () =>
        specWalletGenerateLinkAuthCode
            .response()
            .to.have.responseTimeLessThan(defaultExpectedResponseTime)
);

Then(
    /^The \/linked\-authorization\/link\-auth\-code endpoint response should have status (\d+)$/,
    (status) => specWalletGenerateLinkAuthCode.response().to.have.status(status)
);

Then(
    /^The \/linked\-authorization\/link\-auth\-code endpoint response should have content\-type: application\/json header$/,
    () =>
        specWalletGenerateLinkAuthCode
            .response()
            .should.have.header(contentTypeHeader.key, contentTypeHeader.value)
);

Then(
    /^The \/linked\-authorization\/link\-auth\-code endpoint response should match json schema with no errors$/,
    () => {
      chai
          .expect(specWalletGenerateLinkAuthCode._response.json)
          .to.be.jsonSchema(walletGenerateLinkAuthCodeResponseSchema);
      chai.expect(specWalletGenerateLinkAuthCode._response.json.errors).to.be.empty;
    }
);

// Scenario: Not able to validate the link-code and its expiry and generate the link auth code because of invalid linkCode
// Given and others Then for this scenario are written in the aforementioned example
When(
    /^Send POST \/linked\-authorization\/link\-auth\-code request with given invalid linkCode$/,
    () =>
        specWalletGenerateLinkAuthCode.post(baseUrl)
          .withHeaders(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
          .withJson({
          requestTime: new Date().toISOString(),
          request: {
            linkedCode: 'invalid_linked_code',
            transactionId: transactionId
          },
        })
);

Then(
    /^The \/linked\-authorization\/link\-auth\-code endpoint response should match json schema with errors$/,
    () => {
      chai
          .expect(specWalletGenerateLinkAuthCode._response.json)
          .to.be.jsonSchema(walletGenerateLinkAuthCodeResponseSchema);
      chai.expect(specWalletGenerateLinkAuthCode._response.json.errors).to.not.be.empty;
    }
);

Then(
    /^The \/linked\-authorization\/link\-auth\-code response should contain errorCode property equals to "([^"]*)"$/,
    (errorCode) =>
        chai
            .expect(
                specWalletGenerateLinkAuthCode._response.json.errors
                    .map((error) => error.errorCode)
                    .toString()
            )
            .to.be.equal(errorCode)
);

// Scenario: Not able to validate the link-code and its expiry and generate the link auth code because of invalid transactionId
// Given and others Then for this scenario are written in the aforementioned example
When(
    /^Send POST \/linked\-authorization\/link\-auth\-code request with given invalid transactionId$/,
    () =>
        specWalletGenerateLinkAuthCode.post(baseUrl)
            .withHeaders(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
            .withJson({
              requestTime: new Date().toISOString(),
              request: {
                transactionId: 'invalid_transaction_id',
                linkedCode: receivedLinkCode
              },
            })
);

// Scenario: Not able to validate the link-code and its expiry and generate the link auth code because of invalid linkCode and transactionId
// Given and others Then for this scenario are written in the aforementioned example
When(
    /^Send POST \/linked\-authorization\/link\-auth\-code request with given invalid linkCode and transactionId$/,
    () =>
        specWalletGenerateLinkAuthCode.post(baseUrl)
            .withHeaders(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
            .withJson({
              requestTime: new Date().toISOString(),
              request: {
                transactionId: 'invalid_transaction_id',
                linkedCode: 'invalid_linked_code',
              },
            })
);

// Scenario: Not able to validate the link-code and its expiry and generate the link auth code because of invalid requestTime
// Given and others Then for this scenario are written in the aforementioned example
When(
    /^Send POST \/linked\-authorization\/link\-auth\-code request with given linkCode and transactionId and invalidRequestTime$/,
    () =>
        specWalletGenerateLinkAuthCode.post(baseUrl)
            .withHeaders(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
            .withJson({
              requestTime: null,
              request: {
                transactionId: transactionId,
                linkedCode: receivedLinkCode,
              },
            })
);

// Scenario: Not able to validate the link-code and its expiry because of transaction and link code are not connected to each other
// Given and others Then for this scenario are written in the aforementioned example

When(
    /^Send POST \/linked\-authorization\/link\-auth\-code request with given valid linkCode and transactionId$/,
    () =>
        specWalletGenerateLinkAuthCode.post(baseUrl)
            .withHeaders(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
            .withJson({
              requestTime: new Date().toISOString(),
              request: {
                linkedCode: 'valid_link_code_001',
                transactionId: transactionId
              },
            })
);

// Scenario: Not able to validate the link-code and its expiry because of reuse of the completed transaction_id
// Given and others Then for this scenario are written in the aforementioned example

Given(
    /^The first authorization flow for transactionID ends$/,
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

      receivedLinkCode =
          specWalletGenerateLinkCode._response.json.response.linkCode;

      specWalletLinkTransaction
          .post(localhost + walletLinkTransactionEndpoint)
          .withJson({
            requestTime: new Date().toISOString(),
            request: {
              linkCode: receivedLinkCode,
            },
          });

      await specWalletLinkTransaction.toss();

      receivedLinkedTransactionId =
          specWalletLinkTransaction._response.json.response.linkTransactionId;

      specWalletLinkedAuthenticate.post(localhost + walletLinkedAuthenticateEndpoint)
          .withJson({
            requestTime: new Date().toISOString(),
            request: {
              linkedTransactionId: receivedLinkedTransactionId,
              individualId: individualId,
              challengeList: [
                {
                  authFactorType: "PIN",
                  challenge: "password",
                  format: "alpha-numeric",
                },
              ],
            },
          })

      await specWalletLinkedAuthenticate.toss();

      specWalletGenerateLinkAuthCode.post(baseUrl)
          .withHeaders(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
          .withJson({
            requestTime: new Date().toISOString(),
            request: {
              linkedCode: receivedLinkCode,
              transactionId: 'transaction_id_004'
            },
          })

    }
);

When(
    /^Send POST \/linked\-authorization\/link\-auth\-code request with given linkCode and reused completed transactionId$/,
    () =>
        specWalletGenerateLinkAuthCodeReusable.post(baseUrl)
            .withHeaders(X_XSRF_TOKEN.key, X_XSRF_TOKEN.value)
            .withJson({
              requestTime: new Date().toISOString(),
              request: {
                linkedCode: receivedLinkCode,
                transactionId: 'transaction_id_004'
              },
            })
);

Then(
    /^Receive a response for reuse transactionId from the \/linked\-authorization\/link\-auth\-code endpoint$/,
    async () => await specWalletGenerateLinkAuthCodeReusable.toss()
);

Then(
    /^The \/linked\-authorization\/link\-auth\-code endpoint response for reuse transactionId should be returned in a timely manner 25000ms$/,
    () =>
        specWalletGenerateLinkAuthCodeReusable
            .response()
            .to.have.responseTimeLessThan(linkAuthCodeExpectedResponseTime)
);

Then(
    /^The \/linked\-authorization\/link\-auth\-code endpoint response for reuse transactionId should have status (\d+)$/,
    (status) => specWalletGenerateLinkAuthCodeReusable.response().to.have.status(status)
);

Then(
    /^The \/linked\-authorization\/link\-auth\-code endpoint response for reuse transactionId should have content\-type: application\/json header$/,
    () =>
        specWalletGenerateLinkAuthCodeReusable
            .response()
            .should.have.header(contentTypeHeader.key, contentTypeHeader.value)
);

Then(
    /^The \/linked\-authorization\/link\-auth\-code endpoint response for reuse transactionId should match json schema with errors$/,
    () => {
      chai
          .expect(specWalletGenerateLinkAuthCodeReusable._response.json)
          .to.be.jsonSchema(walletGenerateLinkAuthCodeResponseSchema);
      chai.expect(specWalletGenerateLinkAuthCodeReusable._response.json.errors).to.not.be.empty;
    }
);

Then(
    /^The \/linked\-authorization\/link\-auth\-code response for reuse transactionId should contain errorCode property equals to "([^"]*)"$/,
    (errorCode) =>
        chai
            .expect(
                specWalletGenerateLinkAuthCodeReusable._response.json.errors
                    .map((error) => error.errorCode)
                    .toString()
            )
            .to.be.equal(errorCode)
);

After(endpointTag, () => {
  specWalletGenerateLinkCode.end();
  specWalletGenerateLinkAuthCode.end();
});
