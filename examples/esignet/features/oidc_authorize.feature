@method=GET @endpoint=/authorize
Feature: The authorized endpoint of Open ID Connect (OIDC).

  This is the authorized endpoint of Open ID Connect (OIDC), the relying party applications will do a browser redirect
  to this endpoint with all required details passed as query parameters.

  @smoke
  Scenario: Successfully validates the provided query parameters using the OAuth-details endpoint smoke type test
    Given Wants to validate the provided query parameters using the OAuth-details endpoint
    When Sends GET request with given "openid profile" as scope, "code" as response_type, "e-health-service" as client_id, "http://example-redirect.com" as redirect_uri 
    Then Receives a response from the GET /authorize
    And The GET /authorize endpoint response should be returned in a timely manner 15000ms
    And The GET /authorize endpoint response should have status 200

  @unit @positive
  Scenario Outline: Successfully validates the provided query parameters using the OAuth-details endpoint
    Given Wants to validate the provided query parameters using the OAuth-details endpoint
    When Sends GET request with given "<scope>" as scope, "<response_type>" as response_type, "<client_id>" as client_id, "<redirect_uri>" as redirect_uri, "<state>" as state, "<nonce>" as nonce, "<display>" as display, "<prompt>" as prompt, "<max_age>" as max_age, "<ui_locales>" as ui_locales, "<acr_values>" as acr_values, "<claims_locales>" as claims_locales, "<claims>" as claims
    Then Receives a response from the GET /authorize
    And The GET /authorize endpoint response should be returned in a timely manner 15000ms
    And The GET /authorize endpoint response should have status 200

  Examples: Valid data
  | scope          | response_type | client_id       | redirect_uri                 | state | nonce | display | prompt         | max_age | ui_locales | acr_values              | claims_locales | claims |  
  | openid         | code          | payment-service | http://example-redirect1.com | state | nonce | page    | none           | 10      | en         | idbb:acr:static-code    | en-GB          | name   |
  | profile        | code          | e-bank-service  | http://example-redirect2.com | state | nonce | popup   | login          | 15      | fr         | idbb:acr:generated-code | fr-FR          | name   |
  | email          | code          | e-bank-service  | http://example-redirect3.com | state | nonce | touch   | consent        | 20      | en         | idbb:acr:linked-wallet  | en-GB          | name   |
  | offline_access | code          | health-service  | http://example-redirect4.com | state | nonce | wap     | select_account | 5       | fr         | idbb:acr:biometrics     | fr-FR          | name   |
