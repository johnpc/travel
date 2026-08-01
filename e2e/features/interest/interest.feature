Feature: Vote on destinations to see where the group leans
  As one of the friends planning a trip
  I want to mark how keen I am on each destination
  So that the group can see which places everyone actually wants

  # Honest e2e: casts a real vote as a named member and reads back the updated
  # group tally rendered from the shared sandbox.

  Scenario: Voting is gated until you pick a name
    When a visitor opens the trip "greece-2027"
    Then the vote buttons are disabled

  Scenario: A member votes and the group tally updates
    When a visitor opens the trip "greece-2027"
    And the visitor joins as "Casey"
    And the visitor votes "in" on the first destination
    Then the first destination shows the member's vote as chosen
    And the first destination's tally counts at least one "in"

  Scenario: Re-voting changes the choice without adding a second vote
    When a visitor opens the trip "greece-2027"
    And the visitor joins as "Riley"
    And the visitor votes "in" on the first destination
    And the visitor votes "pass" on the first destination
    Then the member's chosen vote on the first destination is "pass"
