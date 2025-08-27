Feature: Data Persistence and Import/Export
  As a user who has made progress on skills
  I want my progress to be saved and retrievable
  So that I don't lose my development tracking

  Background:
    Given the skill tree application is loaded

  Scenario: Save progress to local storage
    Given I have completed some skills
    When I complete another skill "Time Management"
    Then my progress should automatically save to local storage
    And the save should include skill completion status
    And the save should include earned skill points
    And the save should include unlock states

  Scenario: Restore progress from local storage
    Given I have previously saved progress in local storage
    When I reload the application
    Then my completed skills should remain marked as completed
    And my skill points should match my previous total
    And unlocked skills should remain accessible
    And locked skills should remain locked appropriately

  Scenario: Export progress to JSON file
    Given I have made significant progress on my skill tree
    When I choose to export my progress
    Then I should be able to download a JSON file
    And the JSON should contain all my skill completion data
    And the JSON should include timestamps of completions
    And the JSON should be in a readable format

  Scenario: Import progress from JSON file
    Given I have a valid progress JSON file
    When I choose to import progress
    And I select my progress file
    Then my skill tree should update with the imported data
    And completed skills should show as completed
    And skill points should match the imported values
    And I should see a confirmation of successful import

  Scenario: Handle corrupted or invalid import data
    Given I attempt to import an invalid JSON file
    When the import process runs
    Then I should see an error message
    And my existing progress should remain unchanged
    And I should be prompted to try again with a valid file