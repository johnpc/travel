Feature: See the plan come together
  As one of the friends planning a trip
  I want a summary of where we're leaning
  So that I can see the decision without eyeballing every vote

  # Honest e2e: reads the seeded destinations + votes to surface a front-runner,
  # and exercises the share action.

  Scenario: The plan surfaces the group's front-runner destination
    When a visitor opens the trip "greece-2027"
    Then the plan names a front-runner destination
    And the plan shows a best-dates line
    And the plan shows a budget line

  Scenario: A visitor can share the trip link
    When a visitor opens the trip "greece-2027"
    And the visitor copies the trip link
    Then the share button confirms it copied
