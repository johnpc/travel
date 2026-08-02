Feature: See things to do at a destination
  As one of the friends planning a trip
  I want AI-suggested activities for a destination
  So that we know what we'd actually do when we get there

  # Honest e2e: expands a seeded destination, calls the live Bedrock-backed
  # resolver, and accepts a suggestion into a real Activity row read back from
  # the board.

  Scenario: Expand a destination and get AI activity ideas, then keep one
    When a visitor opens the trip "greece-2027"
    And the visitor expands things to do on the first destination
    And the visitor asks AI to suggest activities
    Then at least one activity suggestion is shown
    When the visitor keeps the first activity suggestion
    Then the kept activity appears in the destination's activity list
    And the kept activity links to a GetYourGuide search
    When the visitor removes the kept activity
    Then the kept activity is gone from the activity list
