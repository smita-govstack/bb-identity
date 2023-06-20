@method=POST @endpoint=/linked-authorization/link-status
Feature: The endpoint to checks the status of link code.

  @smoke @unit @positive
  Scenario: Successfully checks the status of link code smoke type test
    Given Wants to check the status of link code
    And The link code is generated
    When Send POST /linked-authorization/link-status request with given X-XSRF-TOKEN header, transactionId, linkCode and requestTime
    Then Receive a response from the /linked-authorization/link-status endpoint
    And The /linked-authorization/link-status endpoint response should be returned in a timely manner 15000ms
    And The /linked-authorization/link-status endpoint response should have status 200
    And The /linked-authorization/link-status endpoint response should have content-type: application/json header
    And The /linked-authorization/link-status endpoint response should match json schema with no errors
    And The /linked-authorization/link-status response should contain transactionId property equals provided transactionId

  @negative
  Scenario: Not able to check the status of link code because of the invalid transactionId
    Given Wants to check the status of link code
    When Send POST /linked-authorization/link-status request with given X-XSRF-TOKEN header, invalid transactionId, linkCode and requestTime
    Then Receive a response from the /linked-authorization/link-status endpoint
    And The /linked-authorization/link-status endpoint response should be returned in a timely manner 15000ms
    And The /linked-authorization/link-status endpoint response should have status 200
    And The /linked-authorization/link-status endpoint response should have content-type: application/json header
    And The /linked-authorization/link-status endpoint response should match json schema with errors
    And The /linked-authorization/link-status response should contain errorCode property equals to "invalid_transaction_id"

  @negative
  Scenario: Not able to check the status of link code because of the invalid linkCode
    Given Wants to check the status of link code
    When Send POST /linked-authorization/link-status request with given X-XSRF-TOKEN header, transactionId, invalid linkCode and requestTime
    Then Receive a response from the /linked-authorization/link-status endpoint
    And The /linked-authorization/link-status endpoint response should be returned in a timely manner 15000ms
    And The /linked-authorization/link-status endpoint response should have status 200
    And The /linked-authorization/link-status endpoint response should have content-type: application/json header
    And The /linked-authorization/link-status endpoint response should match json schema with errors
    And The /linked-authorization/link-status response should contain errorCode property equals to "invalid_link_code"
