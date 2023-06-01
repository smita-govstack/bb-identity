@method=POST @endpoint=/linked-authorization/link-code
Feature: The endpoint to generate link code.

  @smoke @unit @positive
  Scenario: Successfully generates link code smoke type test
    Given Wants to generate link code
    When Send POST /linked-authorization/link-code request with given X-XSRF-TOKEN header, transactionId and requestTime
    Then Receive a response from the /linked-authorization/link-code endpoint
    And The /linked-authorization/link-code endpoint response should be returned in a timely manner 15000ms
    And The /linked-authorization/link-code endpoint response should have status 200
    And The /linked-authorization/link-code endpoint response should have content-type: application/json header
    And The /linked-authorization/link-code endpoint response should match json schema with no errors
    And The /linked-authorization/link-code response should contain transactionId property equals provided transactionId

  @negative
  Scenario: Not able to generate link code because of a random transaction_id
    Given Wants to generate link code
    When Send POST /linked-authorization/link-code request with given X-XSRF-TOKEN header, random transactionId and "2011-10-05T14:48:00.000Z" as requestTime
    Then Receive a response from the /linked-authorization/link-code endpoint
    And The /linked-authorization/link-code endpoint response should be returned in a timely manner 15000ms
    And The /linked-authorization/link-code endpoint response should have status 200
    And The /linked-authorization/link-code endpoint response should have content-type: application/json header
    And The /linked-authorization/link-code endpoint response should match json schema with errors
    And The /linked-authorization/link-code response should contain errorCode property equals to "invalid_transaction_id"

  @negative
  Scenario: Not able to generate link code because of a blank transaction_id
    Given Wants to generate link code
    When Send POST /linked-authorization/link-code request with given X-XSRF-TOKEN header, blank transactionId and "2011-10-05T14:48:00.000Z" as requestTime
    Then Receive a response from the /linked-authorization/link-code endpoint
    And The /linked-authorization/link-code endpoint response should be returned in a timely manner 15000ms
    And The /linked-authorization/link-code endpoint response should have status 200
    And The /linked-authorization/link-code endpoint response should have content-type: application/json header
    And The /linked-authorization/link-code endpoint response should match json schema with errors
    And The /linked-authorization/link-code response should contain errorCode property equals to "invalid_transaction_id"

  @negative
  Scenario: Not able to generate link code because of reause of the completed transaction_id
    Given Wants to generate link code
    When Send POST /linked-authorization/link-code request with given X-XSRF-TOKEN header, reaused completed transactionId and "2011-10-05T14:48:00.000Z" as requestTime
    Then Receive a response from the /linked-authorization/link-code endpoint
    And The /linked-authorization/link-code endpoint response should be returned in a timely manner 15000ms
    And The /linked-authorization/link-code endpoint response should have status 200
    And The /linked-authorization/link-code endpoint response should have content-type: application/json header
    And The /linked-authorization/link-code endpoint response should match json schema with errors
    And The /linked-authorization/link-code response should contain errorCode property equals to "invalid_transaction_id"
