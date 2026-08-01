Feature: See a generated view of a destination
  As one of the friends planning a trip
  I want an AI-generated image of a destination
  So that we can picture what we'd actually experience there

  # Honest e2e: clicks generate on a seeded destination, which runs the live
  # Bedrock image pipeline, and asserts a real image renders from S3.

  Scenario: Generate a destination image and see it render
    When a visitor opens the trip "greece-2027"
    And the visitor generates an image for the first destination
    Then the first destination shows a generated image
