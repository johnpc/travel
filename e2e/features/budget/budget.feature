Feature: Estimate the budget for a destination
  As one of the friends planning a trip
  I want a rough shared cost estimate per destination
  So that we can gauge whether a trip is affordable

  # Honest e2e: enters an estimate on a seeded destination, saves it to a real
  # BudgetEstimate row, and reads the computed per-person total back.

  Scenario: Enter costs and see the per-person and per-couple totals
    When a visitor opens the trip "greece-2027"
    And the visitor expands things to do on the first destination
    And the visitor enters a flight cost of "500" and lodging of "200" for "4" nights
    Then the per-person total shows "$900"
    And the per-couple total shows "$1,800"
    When the visitor saves the budget estimate
    And the visitor reloads the trip "greece-2027" and expands the first destination
    Then the per-person total shows "$900"
