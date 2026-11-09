Feature: Brainstorm destinations on a trip
  As one of the friends planning a trip
  I want to add destinations and get AI suggestions
  So that the whole group can weigh up where to go

  # Honest e2e: asserts on real destination rows rendered from the shared
  # sandbox. The AI-suggestion scenario calls the live Bedrock-backed resolver.

  Scenario: A visitor adds a destination by hand
    When a visitor opens the trip "greece-2027"
    And the visitor adds the destination "Lisbon, Portugal"
    Then "Lisbon, Portugal" appears on the destination board

  Scenario: A visitor asks AI to suggest destinations and accepts one
    When a visitor opens the trip "greece-2027"
    And the visitor asks AI to suggest destinations
    Then at least one AI suggestion is shown
    When the visitor accepts the first AI suggestion
    Then the accepted suggestion appears on the destination board

  # Undo a mistaken/unwanted destination so it stops skewing the votes.
  Scenario: A visitor removes a destination they added
    When a visitor opens the trip "greece-2027"
    And the visitor adds the destination "Lisbon, Portugal"
    And "Lisbon, Portugal" appears on the destination board
    And the visitor removes that destination
    Then that destination is gone from the board

  # A failed destinations read must offer a retry, not a blank board.
  Scenario: A failed destinations read shows a retry
    When a visitor opens the trip "greece-2027" with destination reads failing
    Then the destinations section shows a retry

  # A place added the moment the trip appears must not be lost while the live
  # list is still connecting (it used to vanish until a reload). Its own fresh
  # trip, so it never shares a board with the scenarios running beside it.
  Scenario: A destination added right as the trip loads stays on the board
    Given real-time updates are slow to connect
    When a visitor opens a fresh trip with a random slug
    And the visitor adds the destination "Lisbon, Portugal"
    Then "Lisbon, Portugal" appears on the destination board
