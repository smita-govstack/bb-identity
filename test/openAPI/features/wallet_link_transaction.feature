@method=POST @endpoint=/linked-authorization/link-transaction
Feature: The endpoint to validates the link-code and its expiry and generates the linkTransactionId.

  @smoke @unit @positive
  Scenario: Successfully validates the link-code and its expiry and generates the linkTransactionId smoke type test
    Given Wants to validate the link-code and its expiry and generate the linkTransactionId
    And The link code is generated before POST /linked-authorization/link-transaction
    When Send POST /linked-authorization/link-transaction request with given linkCode
    Then Receive a response from the /linked-authorization/link-transaction endpoint
    And The /linked-authorization/link-transaction endpoint response should be returned in a timely manner 15000ms
    And The /linked-authorization/link-transaction endpoint response should have status 200
    And The /linked-authorization/link-transaction endpoint response should have content-type: application/json header
    And The /linked-authorization/link-transaction endpoint response should match json schema with no error

  @negative
  Scenario: Not able to validate the link-code and its expiry and generate the linkTransactionId because of invalid linkCode
    Given Wants to validate the link-code and its expiry and generate the linkTransactionId
    When Send POST /linked-authorization/link-transaction request with given invalid linkCode
    Then Receive a response from the /linked-authorization/link-transaction endpoint
    And The /linked-authorization/link-transaction endpoint response should be returned in a timely manner 15000ms
    And The /linked-authorization/link-transaction endpoint response should have status 200
    And The /linked-authorization/link-transaction endpoint response should have content-type: application/json header
    And The /linked-authorization/link-transaction endpoint response should match json schema
    And The /linked-authorization/link-transaction response should contain errorCode property equals to "invalid_link_code"

  @negative
  Scenario: Not able to validate the link-code and its expiry and generate the linkTransactionId because of expired linkCode
    Given Wants to validate the link-code and its expiry and generate the linkTransactionId
    When Send POST /linked-authorization/link-transaction request with given expired linkCode
    Then Receive a response from the /linked-authorization/link-transaction endpoint
    And The /linked-authorization/link-transaction endpoint response should be returned in a timely manner 15000ms
    And The /linked-authorization/link-transaction endpoint response should have status 200
    And The /linked-authorization/link-transaction endpoint response should have content-type: application/json header
    And The /linked-authorization/link-transaction endpoint response should match json schema
    And The /linked-authorization/link-transaction response should contain errorCode property equals to "invalid_link_code"
