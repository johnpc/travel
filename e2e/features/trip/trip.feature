Feature: Plan a trip by URL (guest, no account)
  As one of a group of friends
  I want to open a trip at its own URL and see who's planning it
  So that we can collaborate without anyone signing up

  # Honest e2e: asserts on the real seeded trip + roster rendered from the
  # shared sandbox, not just navigation. The seed creates "Greece 2027" with
  # Alex, Sam, Priya, Jordan.

  Scenario: Opening a seeded trip shows its title and roster
    When a visitor opens the trip "greece-2027"
    Then the trip title "Greece 2027" is shown
    And "Alex" is listed on the roster
    And "Priya" is listed on the roster

  Scenario: Opening a brand-new slug creates the trip on first visit
    When a visitor opens a fresh trip with a random slug
    Then the trip title matching that slug is shown
    And the roster join form is offered

  Scenario: A visitor joins the roster by name
    When a visitor opens the trip "greece-2027"
    And the visitor joins as "Robin"
    Then "Robin" is listed on the roster
    And the app shows they are planning as "Robin"

  # A failed trip read must offer a retry, not hang or blank.
  Scenario: A failed trip read shows a retry, not a blank screen
    When a visitor opens the trip "greece-2027" with the network failing
    Then the trip shows a retry, not a blank screen

  # Account-free safety net: a visited trip is remembered on the device so you
  # never lose the URL by closing the tab.
  Scenario: A visited trip is offered on the home screen to jump back into
    When a visitor opens the trip "greece-2027"
    And the trip title "Greece 2027" is shown
    And the visitor goes back to the home screen
    Then "Greece 2027" is offered under recent trips

  # The app follows the OS theme but a visitor can override it in-app.
  Scenario: A visitor switches the app to dark mode
    When a visitor opens the trip "greece-2027"
    And the visitor taps the theme toggle
    Then the app is in dark mode
