const chai = require('chai');
const { spec, request } = require('pactum');
const { Given, When, Then, Before, After, BeforeAll } = require('@cucumber/cucumber');
const {
  localhost,
  defaultExpectedResponseTime,
  contentTypeHeader,
  clientCreateEndpoint,
  clientResponseSchema,
  envBaseUrl,
  oidcAuthorizationTokenEndpoint,
  oidcAuthorizationToken
} = require('./helpers/helpers');

chai.use(require('chai-json-schema'));

let specClientCreate;
const publicKey1 = {
  "kty": "RSA",
  "e": "AQAB",
  "use": "sig",
  "alg": "RS256",
  "n": "mykWIftknK1TQmbiazuik0rWGsxeOIUE3yfSQJgoCfdGXY4HfHE6AlNKFdIKZOXe-U-L21Klj692e9iZx05rHHaZvO0a4IzyFMOyw5wjBCWoBOcA4q93LPkZTSkIq9I2Vgr6Bzwu6X7QPMbmF8xAKX4KeSn_yZcsAhElHBOWkENmKp76yCyTeE4DAIGah1BcgiB_KWvOZOedwTRDLyQ0DZM1z07-N-rPh0qSd2UFRRY-b_jc9opjyRQq3d5ZkiB9W4ReAUhIKA9uc1RDs1shc3G8zgZp3qH6fYWmsOi23BOA_q8Z-wMHwPK2vEJvgZIWovAG5jGFbMilNcFQfzLJcQ"
};
const publicKey2 = {
  "kty": "RSA",
  "e": "AQAB",
  "use": "sig",
  "alg": "RS256",
  "n": "4jlVXIW3BOmTwZkWAVl-yfENmobN7p5Clk1MbCzkwsdmcFqqCecBZZv-lXY0H1GRI4QEeJgW0H2sLbpjviinJptjPQGeoqUAX_fMUkwBR3vo-ZPoDKGbjJ7affT2fsxcEjTgpEDiNiWNodNKWOAimkLSTvWsT7TgAtKeYtznIwTswTf8TahWdHFaAdsozpb1P7lOQozkhUeeLCULeSSYdVDrycOXXBrr6c_35plgvsZuD0Gn4t-cZv_W_1FR3Uzb0N7Cmt9Vv-pSQTEc-umtWTdGunhWMj6Y82sumszVEKt8wAwS3LU7yNTldfaKzorj8tFXfddma4dBBoG7x6OyGw"
};
const publicKey3 = {
  "kty": "RSA",
  "e": "AQAB",
  "use": "sig",
  "alg": "RS256",
  "n": "jmoiCPAp-Tt2iDCuHow7DUcwv693j-LoihY5v-iNj1i6hXyg0CRwxYDlxbt0sVpLgUo3kxDXaFeecvdfsl2WuxdU4QtGybZTEu3zo9NeA41dYVgVR5MF4lXG9yzmFYFddyiTY0h3ESCCIY4GEVZDxtIsqNhIm4k9jLODXHtHMtnytkBwXma_AzNeFGbodGNaQT82Etp89rai4F83Y8_OlBvr-XLbQTYmBPU1PyzuDqJye9Ggfrbck_gasV0RvuIunWNMff49NYcqvwO7-OEcfA7ue2S5ARzKJc_6RTQ5qJ1sqSnZXOla2ECRGsQJjpI5mKr6U9Jnttqzae5iso0diw"
};
const publicKey4 = {
  "kty": "RSA",
  "e": "AQAB",
  "use": "sig",
  "alg": "RS256",
  "n": "kcZeMeHbb4lhDiUZofm24LaxueLGN94SRye1bgCRl0wXQgx1M0PvJT6pR-hcZ3d8LgmFGvjG79gLSIzQI38KZh1ZlnswKju1A3tAKQUe2657L88DMhHIuCCpAku-au9TLBGhisQLm56BB60LEU4KSByVDyHt6E8FJYsZdCRup5mbIhlJCtpHOxbami1Yf6vGI9UUDmI72vRJn_qZ6nFqPSuWOAktS1FPixe0_ueefZF8CGoVwzc0LHoRwJ5qU2_aZzpaodN340H13N9zLkmfepE1UKcO_KCOnIYezig6FovFtYlxwiPShYGz9gtviJUEYBqJ4RRZQSVPLZURSoiyYw"
};
const publicKey5 = {
  "kty": "RSA",
  "e": "AQAB",
  "use": "sig",
  "alg": "RS256",
  "n": "jemU8_6ZV-JuQvdtuNtr9hWcn1DWyoKzOrdKrzkv4m_ActuNwzURKshwwHF6yM6u7FhkTBUJuxQGKF2TkBm-u44TSU88hjW4dsOawfUXCo0--fy1vpyIJ7FrEpfFX12FGRzCMjLPLAUNmC_OufrNAlnmYnL0PxQuf3DJrN8BA5xY9N93RNhvNY1kVto83BCdfPfmfd2mEENYjcA_iZJ3h5YeSa792EW32YzD738w4mGD3haY52VOf2Xp3hs_EPv9L-HXRgtEd5Mi76w7YHIaPcdo68Jr5yXj17ovtVS2TPdjEdDygPbQxNGpchSj3XfQInoPfVwREvMCICjb_aXVOw"
};
const invalidPublicKey = {
  kty: 'RSA',
  a: 'AQAB',
  use: 'sig',
  alg: 'RS256',
  n: 'mykWIftknK1TQmbiazuik0rWGsxeOIUE3yfSQJgoCfdGXY4HfHE6AlNKFdIKZOXe-U-L21Klj692e9iZx05rHHaZvO0a4IzyFMOyw5wjBCWoBOcA4q93LPkZTSkIq9I2Vgr6Bzwu6X7QPMbmF8xAKX4KeSn_yZcsAhElHBOWkENmKp76yCyTeE4DAIGah1BcgiB_KWvOZOedwTRDLyQ0DZM1z07-N-rPh0qSd2UFRRY-b_jc9opjyRQq3d5ZkiB9W4ReAUhIKA9uc1RDs1shc3G8zgZp3qH6fYWmsOi23BOA_q8Z-wMHwPK2vEJvgZIWovAG5jGFbMilNcFQfzLJcQ',
};

const baseUrl = localhost + clientCreateEndpoint;
const endpointTag = { tags: `@endpoint=/${clientCreateEndpoint}` };
//const authorizeUrl = envBaseUrl + oidcAuthorizationTokenEndpoint;

BeforeAll(async () => {
//   specClientCreate = spec();
//   await specClientCreate.post(authorizeUrl).withJson({
//   id: "string",
//   version: "string",
//   requesttime: new Date().toISOString(),
//   metadata: {},
//   request: {
//     userName:"110123",
//     password: "Techno@123",
//     appId: "partner",
//     clientId: "mosip-pms-client",
//     clientSecret: "ozBwGl57JaAdEX3Z"
//   }
// });

  //request.setDefaultHeaders('Authorization', 'Bearer ' + specClientCreate._response.json.response.token);
  request.setDefaultHeaders('Authorization', 'Bearer ' + oidcAuthorizationToken);
  request.setDefaultTimeout(20000);
})

Before(endpointTag, () => {
  specClientCreate = spec();
});

// Scenario: The new client is successfully added to the Open ID Connect (OIDC) smoke type test
Given(
  'The user wants to add the new client to the Open ID Connect \\(OIDC)',
  () => 'The user wants to add the new client to the Open ID Connect (OIDC)'
);

When(
  'User sends POST request with given requestTime, {string} as clientId, {string} as clientName, {string} as relyingPartyId, {string} as logoUri, publicKey, {string} as authContextRefs, {string} as userClaims, {string} as grantTypes, {string} as clientAuthMethods',
  (
    clientId,
    clientName,
    relyingPartyId,
    logoUri,
    publicKey,
    authContextRefs,
    userClaims,
    grantTypes,
    clientAuthMethods,
    redirectUris
  ) => {
    specClientCreate.post(baseUrl).withJson({
      requestTime: new Date().toISOString(),
      request: {
        clientId: clientId,
        clientName: clientName,
        relyingPartyId: relyingPartyId,
        logoUri: logoUri,
        publicKey: eval(publicKey),
        authContextRefs: [authContextRefs],
        userClaims: [userClaims],
        grantTypes: [grantTypes],
        clientAuthMethods: [clientAuthMethods],
        redirectUris: [redirectUris],
      },
    });
  }
);

Then(
  'User receives a response from the POST \\/client-mgmt\\/oidc-client endpoint',
  () => {
    chai.expect(specClientCreate._response).to.not.be.null;
    console.log(specClientCreate._response.json);
  }
);

Then(
  'The POST \\/client-mgmt\\/oidc-client endpoint response should be returned in a timely manner 15000ms',
  () =>
    specClientCreate
      .response()
      .to.have.responseTimeLessThan(defaultExpectedResponseTime)
);

Then(
  'The POST \\/client-mgmt\\/oidc-client endpoint response should have status 200',
  () => specClientCreate.response().to.have.status(200)
);

Then(
  'The POST \\/client-mgmt\\/oidc-client endpoint response should have content-type: application\\/json header',
  () =>
    specClientCreate
      .response()
      .should.have.header(contentTypeHeader.key, contentTypeHeader.value)
);

Then(
  'The POST \\/client-mgmt\\/oidc-client endpoint response should match json schema',
  () => {
    clientResponseSchema.properties.response.errors = [];
    chai
      .expect(specClientCreate._response.json)
      .to.be.jsonSchema(clientResponseSchema);
  }
);

Then(
  'The POST \\/client-mgmt\\/oidc-client endpoint response should contain {string} as clientId',
  (clientId) =>
    chai
      .expect(specClientCreate._response.json.response.clientId)
      .to.be.equal(clientId)
);

Then(
  'The POST \\/client-mgmt\\/oidc-client endpoint response should contain empty errors array',
  () => chai.expect(specClientCreate._response.json.errors).to.be.empty
);

// Scenario Outline: The new client is successfully added to the Open ID Connect (OIDC)
// Given, Then for this scenario are written in the aforementioned example
When(
  'User sends POST request with given requestTime, {string} as clientId, {string} as clientName, {string} as relyingPartyId, {string} as logoUri, {string} as publicKey, {string} as authContextRefs, {string} as userClaims, {string} as grantTypes, {string} as clientAuthMethods, {string} as redirectUris',
  (
    clientId,
    clientName,
    relyingPartyId,
    logoUri,
    publicKey,
    authContextRefs,
    userClaims,
    grantTypes,
    clientAuthMethods,
    redirectUris
  ) =>
    specClientCreate.post(baseUrl).withJson({
      requestTime: new Date().toISOString(),
      request: {
        clientId: clientId,
        clientName: clientName,
        relyingPartyId: relyingPartyId,
        logoUri: logoUri,
        publicKey: eval(publicKey),
        authContextRefs: [authContextRefs],
        userClaims: [userClaims],
        grantTypes: [grantTypes],
        clientAuthMethods: [clientAuthMethods],
        redirectUris: [redirectUris],
      },
    })
);

// Scenario: Not able to add the new client to the Open ID Connect (OIDC) because of invalid requestTime
// Given, Then for this scenario are written in the aforementioned example
When(
  'User sends POST request with given {string} as invalid requestTime',
  (requestTime) =>
    specClientCreate.post(baseUrl).withJson({
      requestTime: requestTime,
      request: {
        clientId: 'e-health-service-1',
        clientName: 'Health Service',
        relyingPartyId: 'bharath-gov',
        logoUri: 'http://example.com',
        publicKey: publicKey1,
        authContextRefs: ['mosip:idp:acr:generated-code'],
        userClaims: ['name'],
        grantTypes: ['authorization_code'],
        clientAuthMethods: ['private_key_jwt'],
        redirectUris: ['http://example.com/login-success'],
      },
    })
);

Then(
  'The POST \\/client-mgmt\\/oidc-client endpoint response should match json schema with error',
  () =>
    chai
      .expect(specClientCreate._response.json)
      .to.be.jsonSchema(clientResponseSchema)
);

Then(
  'The POST \\/client-mgmt\\/oidc-client endpoint response should match with error code {string}',
  (errorCode) =>
    chai
      .expect(
        specClientCreate._response.json.errors
          .map((error) => error.errorCode)
          .toString()
      )
      .to.be.equals(errorCode)
);

// Scenario: Not able to add the new client to the Open ID Connect (OIDC) because of invalid authContextRefs
// Given, Then for this scenario are written in the aforementioned example
When(
  'User sends POST request with given {string} as invalid authContextRefs',
  (authContextRefs) =>
    specClientCreate.post(baseUrl).withJson({
      requestTime: new Date().toISOString(),
      request: {
        clientId: 'e-health-service-2',
        clientName: 'Health Service',
        relyingPartyId: 'bharath-gov',
        logoUri: 'http://example.com',
        publicKey: publicKey1,
        authContextRefs: [authContextRefs],
        userClaims: ['name'],
        grantTypes: ['authorization_code'],
        clientAuthMethods: ['private_key_jwt'],
        redirectUris: ['http://example.com/login-success'],
      },
    })
);

// Scenario: Not able to add the new client to the Open ID Connect (OIDC) because of invalid userClaims
// Given, Then for this scenario are written in the aforementioned example
When(
  'User sends POST request with given {string} as invalid userClaims',
  (userClaims) =>
    specClientCreate.post(baseUrl).withJson({
      requestTime: new Date().toISOString(),
      request: {
        clientId: 'e-health-service-3',
        clientName: 'Health Service',
        relyingPartyId: 'bharath-gov',
        logoUri: 'http://example.com',
        publicKey: publicKey1,
        authContextRefs: ['mosip:idp:acr:generated-code'],
        userClaims: [userClaims],
        grantTypes: ['authorization_code'],
        clientAuthMethods: ['private_key_jwt'],
        redirectUris: ['http://example.com/login-success'],
      },
    })
);

// Scenario: Not able to add the new client to the Open ID Connect (OIDC) because of invalid grantTypes
// Given, Then for this scenario are written in the aforementioned example
When(
  'User sends POST request with given {string} as invalid grantTypes',
  (grantTypes) =>
    specClientCreate.post(baseUrl).withJson({
      requestTime: new Date().toISOString(),
      request: {
        clientId: 'e-health-service-4',
        clientName: 'Health Service',
        relyingPartyId: 'bharath-gov',
        logoUri: 'http://example.com',
        publicKey: publicKey1,
        authContextRefs: ['mosip:idp:acr:generated-code'],
        userClaims: ['name'],
        grantTypes: [grantTypes],
        clientAuthMethods: ['private_key_jwt'],
        redirectUris: ['http://example.com/login-success'],
      },
    })
);

// Scenario: Not able to add the new client to the Open ID Connect (OIDC) because of invalid clientAuthMethods
// Given, Then for this scenario are written in the aforementioned example
When(
  'User sends POST request with given {string} as invalid clientAuthMethods',
  (clientAuthMethods) =>
    specClientCreate.post(baseUrl).withJson({
      requestTime: new Date().toISOString(),
      request: {
        clientId: 'e-health-service-5',
        clientName: 'Health Service',
        relyingPartyId: 'bharath-gov',
        logoUri: 'http://example.com',
        publicKey: publicKey1,
        authContextRefs: ['mosip:idp:acr:generated-code'],
        userClaims: ['name'],
        grantTypes: ['authorization_code'],
        clientAuthMethods: [clientAuthMethods],
        redirectUris: ['http://example.com/login-success'],
      },
    })
);

// Scenario: Not able to add the new client to the Open ID Connect (OIDC) because of invalid clientName
// Given, Then for this scenario are written in the aforementioned example
When(
  'User sends POST request with given {string} as invalid clientName',
  (clientName) =>
    specClientCreate.post(baseUrl).withJson({
      requestTime: new Date().toISOString(),
      request: {
        clientId: 'e-health-service-6',
        clientName: clientName,
        relyingPartyId: 'bharath-gov',
        logoUri: 'http://example.com',
        publicKey: publicKey1,
        authContextRefs: ['mosip:idp:acr:generated-code'],
        userClaims: ['name'],
        grantTypes: ['authorization_code'],
        clientAuthMethods: ['private_key_jwt'],
        redirectUris: ['http://example.com/login-success'],
      },
    })
);

// Scenario: Not able to add the new client to the Open ID Connect (OIDC) because of invalid relyingPartyId
// Given, Then for this scenario are written in the aforementioned example
When(
  'User sends POST request with given {string} as invalid relyingPartyId',
  (relyingPartyId) =>
    specClientCreate.post(baseUrl).withJson({
      requestTime: new Date().toISOString(),
      request: {
        clientId: 'e-health-service-7',
        clientName: 'e-health-service',
        relyingPartyId: relyingPartyId,
        logoUri: 'http://example.com',
        publicKey: publicKey1,
        authContextRefs: ['mosip:idp:acr:generated-code'],
        userClaims: ['name'],
        grantTypes: ['authorization_code'],
        clientAuthMethods: ['private_key_jwt'],
        redirectUris: ['http://example.com/login-success'],
      },
    })
);

// Scenario: Not able to add the new client to the Open ID Connect (OIDC) because of invalid logoUri
// Given, Then for this scenario are written in the aforementioned example
When(
  'User sends POST request with given {string} as invalid logoUri',
  (logoUri) =>
    specClientCreate.post(baseUrl).withJson({
      requestTime: new Date().toISOString(),
      request: {
        clientId: 'e-health-service-8',
        clientName: 'e-health-service',
        relyingPartyId: 'bharath-gov',
        logoUri: logoUri,
        publicKey: publicKey1,
        authContextRefs: ['mosip:idp:acr:generated-code'],
        userClaims: ['name'],
        grantTypes: ['authorization_code'],
        clientAuthMethods: ['private_key_jwt'],
        redirectUris: ['http://example.com/login-success'],
      },
    })
);

// Scenario: Not able to add the new client to the Open ID Connect (OIDC) because of invalid clientId
// Given, Then for this scenario are written in the aforementioned example
When(
  'User sends POST request with given {string} as invalid clientId',
  (clientId) =>
    specClientCreate.post(baseUrl).withJson({
      requestTime: new Date().toISOString(),
      request: {
        clientId: clientId,
        clientName: 'e-health-service-9',
        relyingPartyId: 'bharath-gov',
        logoUri: 'http://example.com',
        publicKey: publicKey1,
        authContextRefs: ['mosip:idp:acr:generated-code'],
        userClaims: ['name'],
        grantTypes: ['authorization_code'],
        clientAuthMethods: ['private_key_jwt'],
        redirectUris: ['http://example.com/login-success'],
      },
    })
);

// Scenario: Not able to add the new client to the Open ID Connect (OIDC) because of invalid publicKey
// Given, Then for this scenario are written in the aforementioned example
When(
  'User sends POST request with given publicKey as a string not JWT format',
  () =>
    specClientCreate.post(baseUrl).withJson({
      requestTime: new Date().toISOString(),
      request: {
        clientId: 'e-health-service-10',
        clientName: 'e-health-service',
        relyingPartyId: 'bharath-gov',
        logoUri: 'http://example.com',
        publicKey: invalidPublicKey,
        authContextRefs: ['mosip:idp:acr:generated-code'],
        userClaims: ['name'],
        grantTypes: ['authorization_code'],
        clientAuthMethods: ['private_key_jwt'],
        redirectUris: ['http://example.com/login-success'],
      },
    })
);

// Scenario: Not able to add the new client to the Open ID Connect(OIDC) because of invalid redirectUris
// Given, Then for this scenario are written in the aforementioned example
When('User sends POST request with given none redirectUris', () =>
  specClientCreate.post(baseUrl).withJson({
    requestTime: new Date().toISOString(),
    request: {
      clientId: 'e-health-service-11',
      clientName: 'e-health-service',
      relyingPartyId: 'bharath-gov',
      logoUri: 'http://example.com',
      publicKey: publicKey1,
      authContextRefs: ['mosip:idp:acr:generated-code'],
      userClaims: ['name'],
      grantTypes: ['authorization_code'],
      clientAuthMethods: ['private_key_jwt'],
      redirectUris: [],
    },
  })
);

// Scenario: Not able to add the new client to the Open ID Connect (OIDC) because of duplicate clientId
// Given, Then for this scenario are written in the aforementioned example
When('User sends POST request with given {string} as clientId', (clientId) =>
  specClientCreate.post(baseUrl).withJson({
    requestTime: new Date().toISOString(),
    request: {
      clientId: clientId,
      clientName: 'duplicated',
      relyingPartyId: 'bharath-gov',
      logoUri: 'http://example.com',
      publicKey: publicKey1,
      authContextRefs: ['mosip:idp:acr:generated-code'],
      userClaims: ['name'],
      grantTypes: ['authorization_code'],
      clientAuthMethods: ['private_key_jwt'],
      redirectUris: ['http://example.com/login-success'],
    },
  })
);

After(endpointTag, () => {
  specClientCreate.end();
});
