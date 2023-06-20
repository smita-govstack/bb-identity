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
} = require('./helpers/helpers');

chai.use(require('chai-json-schema'));

let specWalletGenerateLinkCode;
let specWalletGenerateLinkAuthCode;
let receivedLinkCode;

const baseUrl = localhost + walletGenerateLinkAuthCodeEndpoint;
const endpointTag = { tags: `@endpoint=/${walletGenerateLinkAuthCodeEndpoint}` };

Before(endpointTag, () => {
  specWalletGenerateLinkAuthCode = spec();
  specWalletGenerateLinkCode = spec();
});

// Scenario: Successfully validates the link-code and its expiry and generates the link auth code smoke type test
Given(
    'Wants to validate the link-auth-code and generate the auth code',
    () =>
        'Wants to validate the link-auth-code and generate the auth code'
);

Given(
    /^The link code is generated before POST \/linked\-authorization\/link\-auth\-code$/,
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

After(endpointTag, () => {
  specWalletGenerateLinkCode.end();
  specWalletGenerateLinkAuthCode.end();
});
