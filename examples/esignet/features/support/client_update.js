const chai = require('chai');
const { spec, request } = require('pactum');
const { Given, When, Then, Before, After, BeforeAll } = require('@cucumber/cucumber');
const {
  localhost,
  clientUpdateEndpoint,
  clientCreateEndpoint,
  defaultExpectedResponseTime,
  contentTypeHeader,
  clientResponseSchema,
  oidcAuthorizationToken
} = require('./helpers/helpers');

chai.use(require('chai-json-schema'));

let specClientCreate;
let specClientUpdate;
let createdClientId;

const baseUrl = localhost + clientUpdateEndpoint;
const endpointTag = { tags: `@endpoint=/${clientUpdateEndpoint}` };
const publicKey1 = {
  "kty": "RSA",
  "e": "AQAB",
  "use": "sig",
  "alg": "RS256",
  "n": "lIhhk3Pw9wriPr32fRXLarqzP4FqCEFAUor0MJIORmBLG7xBgHjF-biB8rYRrujjVuCiQ9u-uJJkNiqnS68ufQjrDRXws6acWRPiRX-avMgnh-ql7sGjAGutSoZKhY2djNhpLFl39w5_rWdYhqU4CYsZPufUqVNQ5QXLXGIe_Z6qTT3M9cVWvdB2Ynk1kAUqyroKnt4jBBLLVlJ-CLRtJILZi9Jl3FsGNDU7jJBX0lGrvhx13HnWt8Is8lDrJ_Z1XwQ4QJsbxFzbHb2Q6NxOPpI6mpKzVEPR00apcvQg36Iihni1PUra1Qj_ZxEpHfATz8MLLLX1lFFdceHwmZy0fw"
};
const publicKey2 = {
  "kty": "RSA",
  "e": "AQAB",
  "use": "sig",
  "alg": "RS256",
  "n": "ihpQ6KKiz7WPnJFZ-YULHXPo7oKzRtc1aAHsPESrAbzngJTwNg1AwuOKMzfT_QHOUs62Xtp0ZT_4Ay38eHD4P1hL3ZqaufxeEvENtXllGv6o8h0n4bqU40K44_QAT412mzBXmMqSXWBqmuR6Yi4dv_KaHQZmva10-NZcY1gy66xNVuJbmeK3s7acUzVB-fY05HUoS00GSEfGuYO_fhvvo6AYIotyg6_WJ4YRCDZfQZptTgOrOutJPvoZQqimbTO91vxqVQtqs2J9UjbVsfjPXYvpyr8yma4zPFPoqAQMnU330E5Pb8zBhHcc9dMhsud7w6x0UxeXDDiEFoiAXeeV-Q"
};
const publicKey3 = {
  "kty": "RSA",
  "e": "AQAB",
  "use": "sig",
  "alg": "RS256",
  "n": "rEjmHBZTYeL3hZljURuuhM7ak6HeSZFZv5_brKUqa7KvXFUQcrw1x5eQ2wvZnV3p4jEvAa-3foeCxpr9g5_bMwJ5upTdZlRDJihY5U1w2NEkp-3j6eVZbY3D1dteac7fkNylJQeIUvHicZe7GWq1UVf7MgF45dOMdIOcdFiq2tBHuB6Ld3-DPNBVQiFGxDxkojnt63afAHHOoZaI-EfvjysIM5b2TziOC-YW6sGnQ4wiipc93PUuJECwylsaJQLHzpRj0_oZpgf0IFRm-quV4x2wUkQEl4F-IzZZDNjYBvZ5WVhWENldOlNkzY2vTGNtW4lx0jrv19OQh4oHy3J02Q"
};
const publicKey4 = {
  "kty": "RSA",
  "e": "AQAB",
  "use": "sig",
  "alg": "RS256",
  "n": "l8pKMQwKdIpxjbQGyxbx3Xe7laVuwJoSd4SpF0adAqtjuJJMBpZ5l2VECGeiMoH95Bkl_PxgmCFkYSeWV8bvz2MCXARUTCTvL5_cs4rtOjU5HOzFtAKWnSdN7AQyiIYps1gXB_FR6Oa56oMNDz9p903uhjTQA1e5Wl3cqh5Ekt6mSoMVe5lSjdlr_NsQwmPAWabBdUfLRTBNTnAijydGbpbO8g6w9c0lITXjzGKGLWxrNIB1bnRDoUQwwcyX7G8qmT7l2BvPnrmq1MiOXYoKmE_iksvvS42vHZtgjZZeuOeHTm4gAP94XQuZkIxsT06meSGVgjM64tcinynj2Qtu0w"
};
const publicKey5 = {
  "kty": "RSA",
  "e": "AQAB",
  "use": "sig",
  "alg": "RS256",
  "n": "h4jVS_q3mCoAK9TFcuKeFdC-oGqVqhxu8-mViEpp_Lub-llIBB7-WM6dEJe5kXFZJD19YcxPt3qBW4XStnZx1PBZ27uMAeax7LvgR64T0zws80OP8_lS2A8wD4vHCewaQBjP_PLpTk1GAxLMVS3CENJRQjkn5MHxkzK5kcm8uwP3zr97iKsKKdWW_wUArTclDaOMwvMRaZIgTb3HSdoIHEAISWs5sU15dj9LUpw8NKjmlNTuYIZGHgDEUanYnakSRocyhP7sofhaCDD40SooMx0LqTPmUdW9VYEwt_E2--R3gFqCbcXgyUr5pAryZ2NNpcRLWnZBj4x_sL4b7leXeQ"
};
const publicKey6 = {
  "kty": "RSA",
  "e": "AQAB",
  "use": "sig",
  "alg": "RS256",
  "n": "uDBsrRs7W7wbwnulMpCmOpfJSlR1Z8B5qKzmRnUFk6JyE6aDPqCEivGWtQpytg5I_dZGQj6XEovEl_ybVogyFR-ibKGPC7v3p0O51HIq3p4Zrrzz7_36NF2Cdv0f0JLFITRXMbBsVeoD1qIcQqPx9ZeT3S6SBUhRVhVZev15ojvZWE1dHb7EdTyNIhUbW9kTOSL1BVhgov6LJevgSX9pxOFH1AyirjlS6RUDrwiLkMYOte0k5q5BYiqm_eTyUJTvMmfZ5F3Kv75RHzcmfcr4ZAZZ3IUBg-Yp2h6dqndJD6RSSkcSTd2pU982JFCfFlYJeMsI1r81pmK4KIDZBwfI7Q"
};
const publicKey7 = {
  "kty": "RSA",
  "e": "AQAB",
  "use": "sig",
  "alg": "RS256",
  "n": "kYBFUdPe80GGOQqg58pl4XVHhuxYMmAbcYLH6PWV08Uyw2rcdusx5heR7swv0SIVBhEXTS2b6XpUkK2yCOQjPOeHDIfhNKjkD7PGjR0qOPEA-Db2yVd-KuDsRPq0uTKasRwPzFzevHY7fzfH920ebMX9Nf4S50qR7iQczWTexLgAeBOhN6YCiQoMhF5R449LGMjVnPePpT14W8WJsTY_hFj4m5wFm34pdP3Ah53ZSesiBMLbv5hQXBdjcJH1EIPQggcFFpsM55MyYphgGXD60AswkwAvmTwCXGYwgi8f8l2OkebfUZR7K5k_h9tIJ9FZP2o8--BSiMK43TCkDeeeVw"
};
const publicKey8 = {
  "kty": "RSA",
  "e": "AQAB",
  "use": "sig",
  "alg": "RS256",
  "n": "syrNlVCrZN5KilI_CNVHYz3cMCJEvFXjSsmy87coY39gEHFEPIglt7iNUJrIVurwz068vPuqeoXIHjA4E6Ak0e26qnt53i2spqyJVuf627-DWEYk48KaDvrc5wjHUXLqIgTEMFakimM2iKpCy6bXGEVYi29bkKIcgX4fdxJFPnpoqm5ZzkZol6rytW5xSCRISFqeBJ80CMu6GEyuqUI8s0D9WpcTsR0xpr47Cb7XXTC0h-dFRwbd2dYH5a2lPPGPss9n5iceOZzGqAbKKrVYS9qjRwqb883YuSKZMhHYLS1k4Fly1af9QPJ_q1_nHOkrUpcDkLOoggUki5jGkz90Lw"
};
const publicKey9 = {
  "kty": "RSA",
  "e": "AQAB",
  "use": "sig",
  "alg": "RS256",
  "n": "rOQtQ4dQOLYXiRltDvd-VKPubXePM-jnK_6UcuzSWZdZdZkvlLpzXV1ujTrgzTln6AyOk2xL6dsHevAW59ezjSCWSuFP7Yj_GGpFX0xhp5FfN2EEDRHkTW6JuIEQrBGp13Gbhax11Yr2FExLWGqdIHiFqGHWMZCU-LHdRZ5A3f4JpOTyduiPd_GcmOAwW7X9hpf9mE-XrybHcfXUn1r81WOz-lyoJnHAZZJCjI4F6dsqSQ_yn7nrfbs9EGJ6nMM80Gi-A_fEm39W1_W023zOvajqph6dXSkV6PDid87G2YS6fdTPLI6YSCDqbrGx9ptKlYgJRRIm7WDgWiP3-fRM-Q"
};

BeforeAll(() => {
  request.setDefaultHeaders('Authorization', 'Bearer ' + oidcAuthorizationToken);
  request.setDefaultTimeout(20000);
})

Before(endpointTag, () => {
  specClientCreate = spec();
  specClientUpdate = spec();
});

// Scenario: The client profile is successfully updated in the Open ID Connect (OIDC) smoke type test
Given(
  'The user wants to update the client profile in the Open ID Connect \\(OIDC)',
  () =>
    'The user wants to update the client profile in the Open ID Connect (OIDC)'
);

Given(
  'The client profile with {string} as clientId, {string} as publicKey is created',
  async (clientId, publicKey) => {
    specClientCreate.post(localhost + clientCreateEndpoint).withJson({
      requestTime: new Date().toISOString(),
      request: {
        clientId: clientId,
        clientName: 'Health Service',
        relyingPartyId: 'bharath-gov',
        logoUri: 'http://example.com',
        publicKey: eval(publicKey),
        authContextRefs: ['mosip:idp:acr:generated-code'],
        userClaims: ['name'],
        grantTypes: ['authorization_code'],
        clientAuthMethods: ['private_key_jwt'],
        redirectUris: ['http://example.com/login-success']
      },
    });
    await specClientCreate.toss();
    console.log(specClientCreate._response.json);
    if(specClientCreate._response.json.response != null)
      createdClientId = specClientCreate._response.json.response.clientId;
    else if(specClientCreate._response.json.errors[0].errorCode == 'duplicate_client_id')
      createdClientId = clientId;
  }
);

When(
  'User sends PUT request with given {string} as client_id parameter, requestTime, {string} as clientName, {string} as status, {string} as logoUri, {string} as redirectUris, {string} as userClaims, {string} as authContextRefs, {string} as grantTypes, {string} as clientAuthMethods',
  (
    client_id,
    clientName,
    status,
    logoUri,
    redirectUris,
    userClaims,
    authContextRefs,
    grantTypes,
    clientAuthMethods
  ) =>
    specClientUpdate
      .put(baseUrl)
      .withPathParams('client_id', client_id)
      .withJson({
        requestTime: new Date().toISOString(),
        request: {
          clientName: clientName,
          status: status,
          logoUri: logoUri,
          redirectUris: [redirectUris],
          userClaims: [userClaims],
          authContextRefs: [authContextRefs],
          grantTypes: [grantTypes],
          clientAuthMethods: [clientAuthMethods],
        },
      })
);

Then(
  'User receives a response from the PUT \\/client-mgmt\\/oidc-client\\/\\{client_id} endpoint',
  () => {
    chai.expect(specClientUpdate._response).to.not.be.null;
    console.log(specClientUpdate._response.json);
  }
);

Then(
  'The PUT \\/client-mgmt\\/oidc-client\\/\\{client_id} endpoint response should be returned in a timely manner 15000ms',
  () =>
    specClientUpdate
      .response()
      .to.have.responseTimeLessThan(defaultExpectedResponseTime)
);

Then(
  'The PUT \\/client-mgmt\\/oidc-client\\/\\{client_id} endpoint response should have status 200',
  () => specClientUpdate.response().to.have.status(200)
);

Then(
  'The PUT \\/client-mgmt\\/oidc-client\\/\\{client_id} endpoint response should have content-type: application\\/json header',
  () =>
    specClientUpdate
      .response()
      .should.have.header(contentTypeHeader.key, contentTypeHeader.value)
);

Then(
  'The PUT \\/client-mgmt\\/oidc-client\\/\\{client_id} endpoint response should match json schema',
  () => {
    clientResponseSchema.properties.response.errors = [];
    chai
      .expect(specClientUpdate._response.json)
      .to.be.jsonSchema(clientResponseSchema);
  }
);

Then(
  'The PUT \\/client-mgmt\\/oidc-client\\/\\{client_id} endpoint response should contain {string} as clientId',
  (clientId) =>
    chai
      .expect(specClientUpdate._response.json.response.clientId)
      .to.be.equal(clientId)
);

Then(
  'The PUT \\/client-mgmt\\/oidc-client\\/\\{client_id} endpoint response should contain empty errors array',
  () => chai.expect(specClientUpdate._response.json.errors).to.be.empty
);

// Scenario: Not able to update the client because of invalid clientAuthMethods
// Given, Then for this scenario are written in the aforementioned example
When(
  'User sends PUT request with given {string} as invalid clientAuthMethods',
  (clientAuthMethods) =>
    specClientUpdate
      .put(baseUrl)
      .withPathParams('client_id', createdClientId)
      .withJson({
        requestTime: new Date().toISOString(),
        request: {
          clientName: 'Health Service',
          status: 'ACTIVE',
          logoUri: 'http://example.com',
          redirectUris: ['http://example-redirect.com'],
          userClaims: ['name'],
          authContextRefs: ['mosip:idp:acr:generated-code'],
          grantTypes: ['authorization_code'],
          clientAuthMethods: [clientAuthMethods],
        },
      })
);

Then(
  'The PUT \\/client-mgmt\\/oidc-client\\/\\{client_id} endpoint response should match json schema with error',
  () =>
    chai
      .expect(specClientUpdate._response.json)
      .to.be.jsonSchema(clientResponseSchema)
);

Then(
  'The PUT \\/client-mgmt\\/oidc-client\\/\\{client_id} endpoint response should match with error code {string}',
  (errorCode) =>
    chai
      .expect(
        specClientUpdate._response.json.errors
          .map((error) => error.errorCode)
          .toString()
      )
      .to.be.equals(errorCode)
);

// Scenario: Not able to update the client because of invalid grantTypes
// Given, Then for this scenario are written in the aforementioned example
When(
  'User sends PUT request with given {string} as invalid grantTypes',
  (grantTypes) =>
    specClientUpdate
      .put(baseUrl)
      .withPathParams('client_id', createdClientId)
      .withJson({
        requestTime: new Date().toISOString(),
        request: {
          clientName: 'Health Service',
          status: 'ACTIVE',
          logoUri: 'http://example.com',
          redirectUris: ['http://example-redirect.com'],
          userClaims: ['name'],
          authContextRefs: ['mosip:idp:acr:generated-code'],
          grantTypes: [grantTypes],
          clientAuthMethods: ['private_key_jwt'],
        },
      })
);

// Scenario: Not able to update the client because of invalid userClaims
// Given, Then for this scenario are written in the aforementioned example
When(
  'User sends PUT request with given {string} as invalid userClaims',
  (userClaims) =>
    specClientUpdate
      .put(baseUrl)
      .withPathParams('client_id', createdClientId)
      .withJson({
        requestTime: new Date().toISOString(),
        request: {
          clientName: 'Health Service',
          status: 'ACTIVE',
          logoUri: 'http://example.com',
          redirectUris: ['http://example-redirect.com'],
          userClaims: [userClaims],
          authContextRefs: ['mosip:idp:acr:generated-code'],
          grantTypes: ['authorization_code'],
          clientAuthMethods: ['private_key_jwt'],
        },
      })
);

// Scenario: Not able to update the client because of invalid authContextRefs
// Given, Then for this scenario are written in the aforementioned example
When(
  'User sends PUT request with given {string} as invalid authContextRefs',
  (authContextRefs) =>
    specClientUpdate
      .put(baseUrl)
      .withPathParams('client_id', createdClientId)
      .withJson({
        requestTime: new Date().toISOString(),
        request: {
          clientName: 'Health Service',
          status: 'ACTIVE',
          logoUri: 'http://example.com',
          redirectUris: ['http://example-redirect.com'],
          userClaims: ['name'],
          authContextRefs: [authContextRefs],
          grantTypes: ['authorization_code'],
          clientAuthMethods: ['private_key_jwt'],
        },
      })
);

// Scenario: Not able to update the client because of invalid redirectUri
// Given, Then for this scenario are written in the aforementioned example
When(
  'User sends PUT request with given {string} as invalid redirectUri',
  (redirectUri) =>
    specClientUpdate
      .put(baseUrl)
      .withPathParams('client_id', createdClientId)
      .withJson({
        requestTime: new Date().toISOString(),
        request: {
          clientName: 'Health Service',
          status: 'ACTIVE',
          logoUri: 'http://example.com',
          redirectUris: [redirectUri],
          userClaims: ['name'],
          authContextRefs: ['mosip:idp:acr:generated-code'],
          grantTypes: ['authorization_code'],
          clientAuthMethods: ['private_key_jwt'],
        },
      })
);

// Scenario: Not able to update the client because of invalid logoUri
// Given, Then for this scenario are written in the aforementioned example
When(
  'User sends PUT request with given {string} as invalid logoUri',
  (logoUri) =>
    specClientUpdate
      .put(baseUrl)
      .withPathParams('client_id', createdClientId)
      .withJson({
        requestTime: new Date().toISOString(),
        request: {
          clientName: 'Health Service',
          status: 'ACTIVE',
          logoUri: logoUri,
          redirectUris: ['http://example-redirect.com'],
          userClaims: ['name'],
          authContextRefs: ['mosip:idp:acr:generated-code'],
          grantTypes: ['authorization_code'],
          clientAuthMethods: ['private_key_jwt'],
        },
      })
);

// Scenario: Not able to update the client because of invalid clientName
// Given, Then for this scenario are written in the aforementioned example
When(
  'User sends PUT request with given {string} as invalid clientName',
  (clientName) =>
    specClientUpdate
      .put(baseUrl)
      .withPathParams('client_id', createdClientId)
      .withJson({
        requestTime: new Date().toISOString(),
        request: {
          clientName: clientName,
          status: 'ACTIVE',
          logoUri: 'http://example.com',
          redirectUris: ['http://example-redirect.com'],
          userClaims: ['name'],
          authContextRefs: ['mosip:idp:acr:generated-code'],
          grantTypes: ['authorization_code'],
          clientAuthMethods: ['private_key_jwt'],
        },
      })
);

// Scenario: Not able to update the client because of invalid client_id
// Given, Then for this scenario are written in the aforementioned example
When(
  'User sends PUT request with given {string} as invalid client_id',
  (client_id) =>
    specClientUpdate
      .put(baseUrl)
      .withPathParams('client_id', client_id)
      .withJson({
        requestTime: new Date().toISOString(),
        request: {
          clientName: 'Health Service',
          status: 'ACTIVE',
          logoUri: 'http://example.com',
          redirectUris: ['http://example-redirect.com'],
          userClaims: ['name'],
          authContextRefs: ['mosip:idp:acr:generated-code'],
          grantTypes: ['authorization_code'],
          clientAuthMethods: ['private_key_jwt'],
        },
      })
);

After(endpointTag, () => {
  specClientCreate.end();
  specClientUpdate.end();
});
