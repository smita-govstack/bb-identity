const chai = require('chai');
const { spec } = require('pactum');
const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const {
  localhost,
  defaultExpectedResponseTime,
  contentTypeHeader,
  clientCreateEndpoint,
  clientResponseSchema,
} = require('./helpers/helpers');

chai.use(require('chai-json-schema'));

let specClientCreate;
let token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhUDBjQl85ei1oYWwtRm9qdXV2bmJTSGpoVm9qYl9oVlQ5NnU4Zjh0dFNFIn0.eyJleHAiOjE2ODY2ODc3NzksImlhdCI6MTY4NjY1MTc3OSwianRpIjoiMGQ1MmRhOTUtMjY4Zi00ZjdhLTkzN2UtNmUyMWM1MmU1MDkxIiwiaXNzIjoiaHR0cHM6Ly9pYW0ub25wcmVtYjMuaWRlbmNvZGUubGluay9hdXRoL3JlYWxtcy9tb3NpcCIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI4MzNiN2I4YS1hOWY4LTQ4NGEtODFlZi00YWMwYTU2ODViOWMiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJtb3NpcC1wbXMtY2xpZW50Iiwic2Vzc2lvbl9zdGF0ZSI6IjgwYjE2YmNhLTk4NmEtNDA3Ny1iMWNiLWYxOWZhY2NlMTdmOSIsImFjciI6IjEiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiUkVHSVNUUkFUSU9OX09GRklDRVIiLCJkZWZhdWx0LXJvbGVzLW1vc2lwIiwiUkVHSVNUUkFUSU9OX1BST0NFU1NPUiIsIlJFR0lTVFJBVElPTl9BRE1JTiIsIlpPTkFMX0FETUlOIiwiUkVHSVNUUkFUSU9OX1NVUEVSVklTT1IiLCJGVE1fUFJPVklERVIiLCJNQVNURVJEQVRBX0FETUlOIiwiUE1TX1VTRVIiLCJvZmZsaW5lX2FjY2VzcyIsIlBBUlRORVJfQURNSU4iLCJ1bWFfYXV0aG9yaXphdGlvbiIsIk1JU1AiLCJHTE9CQUxfQURNSU4iLCJQQVJUTkVSIiwiS0VZX01BS0VSIiwiUkVHSVNUUkFUSU9OX09QRVJBVE9SIiwiUEFSVE5FUk1BTkFHRVIiLCJBVVRIX1BBUlRORVIiLCJERVZJQ0VfUFJPVklERVIiLCJEZWZhdWx0IiwiQ0VOVFJBTF9BRE1JTiIsIlBNU19BRE1JTiIsIk9OTElORV9WRVJJRklDQVRJT05fUEFSVE5FUiIsIkFVVEgiLCJQT0xJQ1lNQU5BR0VSIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJnZXRfY2VydGlmaWNhdGUgdXBkYXRlX29pZGNfY2xpZW50IGFkZF9vaWRjX2NsaWVudCB1cGxvYWRfY2VydGlmaWNhdGUgcHJvZmlsZSBlbWFpbCIsInNpZCI6IjgwYjE2YmNhLTk4NmEtNDA3Ny1iMWNiLWYxOWZhY2NlMTdmOSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicHJlZmVycmVkX3VzZXJuYW1lIjoiMTEwMTIzIn0.ULRWvKc_jKeXO4uF61YKmBHkIk9qCq2mIzmWu0eAgXprHUrQqGsmwDWqzoGAZ__xg-R6CnYDHacC8hRRB2GSi8Erdlfw0Yu-YpFWWPbtBQ4Su9aG1hSTDBdWLwqvLwhC7P8K0jtDWiTCO3GSbY39KvINs_XTyaBW9NtiDj-RTFOEgGT5L6IWqHzzs2w9HMohRGVgteMq9cTmAoJnh8h9Nh09yJepIt_fyQeO1q7q9BHpZwLUEFmyYNH0JZKuNLy6rtEuOK0kCFYY3PBP2NwA6ALsUfc4tolEL5gTF38RZnxyBfOOKY8j-v6lwotb9Y1mIHMQWY8PhXAWryGVGSwGtg";
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

const baseUrl = localhost + clientCreateEndpoint;
const endpointTag = { tags: `@endpoint=/${clientCreateEndpoint}` };

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
    authContextRefs,
    userClaims,
    grantTypes,
    clientAuthMethods,
    redirectUris
  ) => {
    specClientCreate.post(baseUrl).withHeaders({
      'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhUDBjQl85ei1oYWwtRm9qdXV2bmJTSGpoVm9qYl9oVlQ5NnU4Zjh0dFNFIn0.eyJleHAiOjE2ODY2OTA3NjQsImlhdCI6MTY4NjY1NDc2NCwianRpIjoiZmFkMzMxOWQtOTcxMy00MmY1LTkxNjMtOWRjNGMzMzFjY2FmIiwiaXNzIjoiaHR0cHM6Ly9pYW0ub25wcmVtYjMuaWRlbmNvZGUubGluay9hdXRoL3JlYWxtcy9tb3NpcCIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJjN2Y2OTcxOS01Y2MyLTQ2ZTMtOGE4MS1iMWFiNmZhYTE2NDciLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJtb3NpcC1wbXMtY2xpZW50Iiwic2Vzc2lvbl9zdGF0ZSI6IjY2ZmUyZmU1LTJiMmYtNDMwNi1iYzg0LWNiYjJkZDc4N2FkNiIsImFjciI6IjEiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiUkVHSVNUUkFUSU9OX09GRklDRVIiLCJLRVlfTUFLRVIiLCJSRUdJU1RSQVRJT05fT1BFUkFUT1IiLCJBVVRIX1BBUlRORVIiLCJEZWZhdWx0IiwiZGVmYXVsdC1yb2xlcy1tb3NpcCIsIkNFTlRSQUxfQURNSU4iLCJSRUdJU1RSQVRJT05fUFJPQ0VTU09SIiwiUkVHSVNUUkFUSU9OX0FETUlOIiwiWk9OQUxfQURNSU4iLCJSRUdJU1RSQVRJT05fU1VQRVJWSVNPUiIsIk1BU1RFUkRBVEFfQURNSU4iLCJPTkxJTkVfVkVSSUZJQ0FUSU9OX1BBUlRORVIiLCJBVVRIIiwib2ZmbGluZV9hY2Nlc3MiLCJQQVJUTkVSX0FETUlOIiwidW1hX2F1dGhvcml6YXRpb24iLCJHTE9CQUxfQURNSU4iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6ImdldF9jZXJ0aWZpY2F0ZSB1cGRhdGVfb2lkY19jbGllbnQgYWRkX29pZGNfY2xpZW50IHVwbG9hZF9jZXJ0aWZpY2F0ZSBwcm9maWxlIGVtYWlsIiwic2lkIjoiNjZmZTJmZTUtMmIyZi00MzA2LWJjODQtY2JiMmRkNzg3YWQ2IiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiZ2xvYmFsYWRtaW4gZ2xvYmFsYWRtaW4iLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJnbG9iYWxhZG1pbiIsImdpdmVuX25hbWUiOiJnbG9iYWxhZG1pbiIsImZhbWlseV9uYW1lIjoiZ2xvYmFsYWRtaW4iLCJlbWFpbCI6Imdsb2JhbGFkbWluQGdtYWlsLmNvbSJ9.e7mXu2JTZz8h5CsPPTSo5lJ1GWs0gqfPWBC06DO24yh9eOZpkE1968LUnGLahCoS2nhas2t40v7AsbRW0azV5taBThWz-GHx2GU7CAxzCWlluQE26g7vr2l4HQAywsclnIbZzv6YQ4Aa2GaEYVV6FhaCzc80hX5hBUYtOUAZJYjbZv72BefeiXA6h6ddk6ECFKZQ7h-r9yQItP_W6KIhWu1ICenIUaQZPgnFwSZYkJHY2ilnMmThWJl_dkMS5eKu8GDQdsRnOllts1X_K2t5FdPskzE3MXJLxn5dx9odoRKek03DGLC5PH88nAYEXxeEIFxwyDZHNRpHSiKiJlvk0w'
  }).withJson({
      requestTime: new Date().toISOString(),
      request: {
        clientId: clientId,
        clientName: clientName,
        relyingPartyId: relyingPartyId,
        logoUri: logoUri,
        publicKey: base64ToJson(publicKey),
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
  async () => await specClientCreate.toss()
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
  'User sends POST request with given requestTime, {string} as clientId, {string} as clientName, {string} as relyingPartyId, {string} as logoUri, publicKey, {string} as authContextRefs, {string} as userClaims, {string} as grantTypes, {string} as clientAuthMethods, {string} as redirectUris',
  (
    clientId,
    clientName,
    relyingPartyId,
    logoUri,
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
        publicKey: base64ToJson(publicKey),
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
        publicKey: base64ToJson(publicKey),
        authContextRefs: ['idbb:acr:generated-code'],
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
        publicKey: base64ToJson(publicKey),
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
        publicKey: base64ToJson(publicKey),
        authContextRefs: ['idbb:acr:generated-code'],
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
        publicKey: base64ToJson(publicKey),
        authContextRefs: ['idbb:acr:generated-code'],
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
        publicKey: base64ToJson(publicKey),
        authContextRefs: ['idbb:acr:generated-code'],
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
        publicKey: base64ToJson(publicKey),
        authContextRefs: ['idbb:acr:generated-code'],
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
        publicKey: base64ToJson(publicKey),
        authContextRefs: ['idbb:acr:generated-code'],
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
        publicKey: base64ToJson(publicKey),
        authContextRefs: ['idbb:acr:generated-code'],
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
        publicKey: base64ToJson(publicKey),
        authContextRefs: ['idbb:acr:generated-code'],
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
        publicKey: publicKey,
        authContextRefs: ['idbb:acr:generated-code'],
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
      publicKey: base64ToJson(publicKey),
      authContextRefs: ['idbb:acr:generated-code'],
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
      publicKey: base64ToJson(publicKey),
      authContextRefs: ['idbb:acr:generated-code'],
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
