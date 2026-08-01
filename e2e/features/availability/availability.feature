Feature: Mark when you're free so the group can pick dates
  As one of the friends planning a trip
  I want to mark which days I'm available
  So that we can find dates that work for everyone

  # Honest e2e: marks a real day as a named member and reads back the group's
  # free-count rendered from the shared sandbox.

  Scenario: Marking dates is gated until you pick a name
    When a visitor opens the trip "greece-2027"
    Then the calendar days are not markable

  Scenario: A member marks a day free and it shows their status
    When a visitor opens the trip "greece-2027"
    And the visitor joins as "Dana"
    And the visitor marks the 15th of the current month free
    Then the 15th shows the visitor as free

  Scenario: The calendar can move to another month
    When a visitor opens the trip "greece-2027"
    And the visitor goes to next month
    Then the calendar shows a different month than it opened on

  Scenario: Marking a range free surfaces a candidate window to jump to
    When a visitor opens the trip "greece-2027"
    And the visitor joins as "Blake"
    And the visitor marks a free range in the current month
    Then a candidate date window is listed
    When the visitor jumps to the first candidate window
    Then the calendar shows that window's month
