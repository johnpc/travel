Feature: See what a destination looks like
  As one of the friends planning a trip
  I want to see real photos of a destination at a glance
  So that we can picture the place without any extra taps

  # Honest e2e: opens a seeded trip and asserts a REAL destination photo renders
  # automatically (Wikimedia Commons), and that the "imagine it with AI" option
  # is offered. We don't drive the live Bedrock generation here — it's a slow,
  # costly round-trip; the fast auto-photo is the primary experience.

  Scenario: A destination shows a real photo automatically, no tap
    When a visitor opens the trip "greece-2027"
    Then the first destination shows a photo automatically
    And the destination offers to reimagine the view with AI
