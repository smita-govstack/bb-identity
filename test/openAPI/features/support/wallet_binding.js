const chai = require('chai');
const { spec } = require('pactum');
const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const {
  localhost,
  defaultExpectedResponseTime,
  walletBindingEndpoint,
  walletBindingResponseSchema,
} = require('./helpers/helpers');

chai.use(require('chai-json-schema'));

let specWalletBinding;
const publicKey = JSON.stringify({
  kty: 'RSA',
  a: 'AQAB',
  use: 'sig',
  alg: 'RS256',
  n: 'mykWIftknK1TQmbiazuik0rWGsxeOIUE3yfSQJgoCfdGXY4HfHE6AlNKFdIKZOXe-U-L21Klj692e9iZx05rHHaZvO0a4IzyFMOyw5wjBCWoBOcA4q93LPkZTSkIq9I2Vgr6Bzwu6X7QPMbmF8xAKX4KeSn_yZcsAhElHBOWkENmKp76yCyTeE4DAIGah1BcgiB_KWvOZOedwTRDLyQ0DZM1z07-N-rPh0qSd2UFRRY-b_jc9opjyRQq3d5ZkiB9W4ReAUhIKA9uc1RDs1shc3G8zgZp3qH6fYWmsOi23BOA_q8Z-wMHwPK2vEJvgZIWovAG5jGFbMilNcFQfzLJcQ',
});

const base64ToJson = (publicKey) => {
  JSON.parse(publicKey);
  return Buffer.from(publicKey).toString('base64');
};

const baseUrl = localhost + walletBindingEndpoint;
const endpointTag = { tags: `@endpoint=/${walletBindingEndpoint}` };

Before(endpointTag, () => {
  specWalletBinding = spec();
});

// Scenario: Successfully validates the wallet and generates the wallet user id smoke type test
Given('Wants to validate the wallet and generate wallet user id',
    () => 'Wants to validate the wallet and generate wallet user id');

When(
    /^Send POST \/wallet\-binding request with given "([^"]*)" as individualId and "([^"]*)" as authFactorType and "([^"]*)" as format and "([^"]*)" as challenge and publicKey$/,
    (individualId, authFactorType, format, challenge) =>
        specWalletBinding
            .post(baseUrl)
            .withJson({
              requestTime: new Date().toISOString(),
              request: {
                individualId: individualId,
                authFactorType: authFactorType,
                format: format,
                challengeList: {
                  authFactorType: authFactorType,
                  challenge: challenge,
                  format: format,
                },
                publicKey: base64ToJson(publicKey),
              },
            })
);

Then(
    /^Receive a response from the \/wallet\-binding endpoint$/,
    async () => await specWalletBinding.toss()
);

Then(
    /^The \/wallet\-binding response should be returned in a timely manner 15000ms$/,
    () =>
        specWalletBinding
            .response()
            .to.have.responseTimeLessThan(defaultExpectedResponseTime)
);

Then(
    /^The \/wallet\-binding endpoint response should have status (\d+)$/,
    (status) => specWalletBinding.response().to.have.status(status)
);

Then(
    /^The \/wallet\-binding endpoint response should match json schema with no errors$/,
    () => {
      chai
          .expect(specWalletBinding._response.json)
          .to.be.jsonSchema(walletBindingResponseSchema);
      chai.expect(specWalletBinding._response.json.errors).to.be.empty;
    }
);

// Scenario: Not able to generate the wallet binding because of unsupported challenge format
// Given and others Then for this scenario are written in the aforementioned example
When(
    /^Send POST \/wallet\-binding request with given invalid format "([^"]*)" as individualId and "([^"]*)" as authFactorType and "([^"]*)" as format and "([^"]*)" as challenge and publicKey$/,
    (individualId, authFactorType, format, challenge) =>
        specWalletBinding
            .post(baseUrl)
            .withJson({
              requestTime: new Date().toISOString(),
              request: {
                individualId: individualId,
                authFactorType: authFactorType,
                format: format,
                challengeList: {
                  authFactorType: authFactorType,
                  challenge: challenge,
                  format: format,
                },
                publicKey: base64ToJson(publicKey),
              },
            })
);

  Then(
      /^The \/wallet\-binding endpoint response should match json schema with errors$/,
      () => {
        chai
            .expect(specWalletBinding._response.json)
            .to.be.jsonSchema(walletBindingResponseSchema);
        chai.expect(specWalletBinding._response.json.errors).to.not.be.empty;
      }
  );

Then(
    /^The \/wallet\-binding response should contain errorCode property equals to "([^"]*)"$/,
    (errorCode) =>
        chai
            .expect(
                specWalletBinding._response.json.errors
                    .map((error) => error.errorCode)
                    .toString()
            )
            .to.be.equal(errorCode)
);

// Scenario: Not able to generate the wallet binding because of unsupported challenge format
// Given and others Then for this scenario are written in the aforementioned example
When(
  /^Send POST \/wallet\-binding request with given format "([^"]*)" as individualId and "([^"]*)" as authFactorType and "([^"]*)" as format and "([^"]*)" as challenge and invalid publicKey$/,
  (individualId, authFactorType, format, challenge) =>
    specWalletBinding
      .post(baseUrl)
      .withJson({
        requestTime: new Date().toISOString(),
        request: {
          individualId: individualId,
          authFactorType: authFactorType,
          format: format,
          challengeList: {
            authFactorType: authFactorType,
            challenge: challenge,
            format: format,
          },
          publicKey: publicKey,
        },
      })
);


After(endpointTag, () => {
  specWalletBinding.end();
});
