const { spec } = require('pactum');
const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const {
  localhost,
  oidcAuthorizeEndpoint,
  defaultExpectedResponseTime,
  esignetUIUrl
} = require('./helpers/helpers');

let specOIDCAuthorize;

const baseUrl = esignetUIUrl + oidcAuthorizeEndpoint;
const endpointTag = { tags: `@endpoint=/${oidcAuthorizeEndpoint}` };

Before(endpointTag, () => {
  specOIDCAuthorize = spec();
});

// Scenario: Successfully validates the provided query parameters using the OAuth-details endpoint smoke type test
Given(
  'Wants to validate the provided query parameters using the OAuth-details endpoint',
  () =>
    'Wants to validates the provided query parameters using the OAuth-details endpoint'
);

When(
  'Sends GET request with given {string} as scope, {string} as response_type, {string} as client_id, {string} as redirect_uri',
  (scope, responseType, clientId, redirectUri) =>
    specOIDCAuthorize.get(baseUrl).withQueryParams({
      scope: scope,
      response_type: responseType,
      client_id: clientId,
      redirect_uri: redirectUri,
    })
);

Then('Receives a response from the GET \\/authorize', async () => {
  await specOIDCAuthorize.toss();
});

Then(
  'The GET \\/authorize endpoint response should be returned in a timely manner 15000ms',
  () =>
    specOIDCAuthorize
      .response()
      .to.have.responseTimeLessThan(defaultExpectedResponseTime)
);

Then('The GET \\/authorize endpoint response should have status 200', () =>
  specOIDCAuthorize.response().to.have.status(200)
);

// Scenario Outline: Successfully validates the provided query parameters using the OAuth-details endpoint
// Given, Then for this scenario are written in the aforementioned example
When(
  'Sends GET request with given {string} as scope, {string} as response_type, {string} as client_id, {string} as redirect_uri, {string} as state, {string} as nonce, {string} as display, {string} as prompt, {string} as max_age, {string} as ui_locales, {string} as acr_values, {string} as claims_locales, {string} as claims',
  (
    scope,
    responseType,
    clientId,
    redirectUri,
    state,
    nonce,
    display,
    prompt,
    maxAge,
    uiLocales,
    acrValues,
    claimsLocales,
    claims
  ) =>
    specOIDCAuthorize.get(baseUrl).withQueryParams({
      scope: scope,
      response_type: responseType,
      client_id: clientId,
      redirect_uri: redirectUri,
      state: state,
      nonce: nonce,
      display: display,
      prompt: prompt,
      max_age: maxAge,
      ui_locales: uiLocales,
      acr_values: acrValues,
      claims_locales: claimsLocales,
      claims: claims,
    })
);

After(endpointTag, () => {
  specOIDCAuthorize.end();
});
