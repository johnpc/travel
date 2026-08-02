Feature: Plan a multi-city itinerary
  As one of the friends planning a bigger trip
  I want an ordered route of stops (added by hand or AI-suggested)
  So that we can plan a multi-city adventure, not just one destination

  # Honest e2e: adds a real ItineraryStop, reads it back on the board, reorders
  # it, and removes it. The AI-route scenario calls the live Bedrock resolver.

  Scenario: Add stops by hand and reorder the route
    When a visitor opens the trip "greece-2027"
    And the visitor adds the stop "Tokyo"
    And the visitor adds the stop "Bangkok"
    Then the itinerary lists "Tokyo" before "Bangkok"
    When the visitor moves "Bangkok" earlier
    Then the itinerary lists "Bangkok" before "Tokyo"
    When the visitor removes the stop "Tokyo"
    Then "Tokyo" is gone from the itinerary

  Scenario: Ask AI to suggest a multi-city route and add a stop
    When a visitor opens the trip "greece-2027"
    And the visitor asks AI to suggest a route
    Then at least one route suggestion is shown
    When the visitor adds the first route suggestion
    Then the itinerary has at least one stop
