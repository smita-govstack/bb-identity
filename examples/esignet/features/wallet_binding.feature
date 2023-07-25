@method=POST @endpoint=/binding/wallet-binding
Feature: The endpoint to validate wallet create wallet user id

  @smoke @unit @positive
  Scenario: Successfully validates the wallet and generates the wallet user id smoke type test
    Given Wants to validate the wallet and generate wallet user id
    And Send otp with given "9352472058" as individualId
    When Send POST /wallet-binding request with given "9352472058" as individualId and "OTP" as authFactorType and "alpha-numeric" as format and "111111" as challenge and publicKey
    Then Receive a response from the /wallet-binding endpoint
    And The /wallet-binding response should be returned in a timely manner 15000ms
    And The /wallet-binding endpoint response should have status 200
    And The /wallet-binding endpoint response should match json schema with no errors

  @negative
  Scenario: Not able to generate the wallet binding because of unsupported challenge format
    Given Wants to validate the wallet and generate wallet user id
    When Send POST /wallet-binding request with given invalid format "n3fy2qkg9r7h2" as individualId and "OTP" as authFactorType and "invalid_format" as format and "string" as challenge and publicKey
    Then Receive a response from the /wallet-binding endpoint
    And The /wallet-binding response should be returned in a timely manner 15000ms
    And The /wallet-binding endpoint response should have status 200
    And The /wallet-binding endpoint response should match json schema with errors
    And The /wallet-binding response should contain errorCode property equals to "invalid_challenge_format"

  @negative
  Scenario: Not able to generate the wallet binding because of invalid public key
    Given Wants to validate the wallet and generate wallet user id
    When Send POST /wallet-binding request with given format "n3fy2qkg9r7h2" as individualId and "OTP" as authFactorType and "alpha-numeric" as format and "string" as challenge and invalid publicKey
    Then Receive a response from the /wallet-binding endpoint
    And The /wallet-binding response should be returned in a timely manner 15000ms
    And The /wallet-binding endpoint response should have status 200
    And The /wallet-binding endpoint response should match json schema with errors
    And The /wallet-binding response should contain errorCode property equals to "invalid_public_key"
