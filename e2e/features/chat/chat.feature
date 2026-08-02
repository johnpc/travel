Feature: Discuss the trip to reach consensus
  As one of the friends planning a trip
  I want a shared discussion thread
  So that we can hash out the final details and lock it in together

  # Honest e2e: joins the roster, posts a real Message, reads it back live, and
  # confirms a non-member is nudged to pick a name before chatting.

  Scenario: A member posts a message and sees it in the thread
    When a visitor opens the trip "greece-2027"
    And the visitor joins as "Robin"
    And the visitor posts the message "Locking in Santorini — book flights?"
    Then the message "Locking in Santorini — book flights?" appears in the discussion

  Scenario: You must pick a name before you can chat
    When a visitor opens the trip "greece-2027"
    Then the discussion asks you to pick your name
