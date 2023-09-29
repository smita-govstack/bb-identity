@method=POST @endpoint=/linked-authorization/link-auth-code
Feature: The endpoint to validates the link-code and its expiry and generates the link auth code.

  @smoke @unit @positive
  Scenario: Successfully validates the link-code and its expiry and generates the link auth code smoke type test
    Given Wants to validate the link-auth-code and generate the auth code
    And The link code is generated before POST /linked-authorization/link-auth-code
    When Send POST /linked-authorization/link-auth-code request with given linkCode and transactionId
    Then Receive a response from the /linked-authorization/link-auth-code endpoint
    And The /linked-authorization/link-auth-code endpoint response should be returned in a timely manner 15000ms
    And The /linked-authorization/link-auth-code endpoint response should have status 200
    And The /linked-authorization/link-auth-code endpoint response should have content-type: application/json header
    And The /linked-authorization/link-auth-code endpoint response should match json schema with no errors

  @negative
  Scenario: Not able to validate the link-code and its expiry and generate the link auth code because of invalid linkCode
    Given Wants to validate the link-auth-code and generate the auth code
    When Send POST /linked-authorization/link-auth-code request with given invalid linkCode
    Then Receive a response from the /linked-authorization/link-auth-code endpoint
    And The /linked-authorization/link-auth-code endpoint response should be returned in a timely manner 15000ms
    And The /linked-authorization/link-auth-code endpoint response should have status 200
    And The /linked-authorization/link-auth-code endpoint response should have content-type: application/json header
    And The /linked-authorization/link-auth-code endpoint response should match json schema with errors
    And The /linked-authorization/link-auth-code response should contain errorCode property equals to "invalid_link_code"
