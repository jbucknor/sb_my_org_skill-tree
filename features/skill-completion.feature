Feature: Skill Completion and Progress Tracking
  As a user working on personal development
  I want to mark skills as completed and track my progress
  So that I can see my advancement and stay motivated

  Background:
    Given the skill tree application is loaded
    And I am viewing a skill node

  Scenario: Complete a skill
    Given I have an incomplete skill "Active Listening" in the Family category
    When I click on the skill node
    Then I should see skill completion options
    When I mark the skill as completed
    Then the skill node should visually indicate completion
    And my skill points should increase accordingly
    And the completion should be saved to local storage

  Scenario: View skill details before completion
    Given I have selected a skill "Active Listening"
    When I view the skill details
    Then I should see the skill name "Active Listening"
    And I should see the skill description
    And I should see the time requirement "15 hours"
    And I should see the point value "3 points"
    And I should see the list of achievements required

  Scenario: Prerequisites prevent premature completion
    Given I have a skill with prerequisites
    And the prerequisites are not yet completed
    When I try to complete the skill
    Then I should see a message about missing prerequisites
    And the skill should remain locked
    And I should see which prerequisites need completion

  Scenario: Unlock dependent skills after completion
    Given I have completed a prerequisite skill
    When the skill completion is processed
    Then dependent skills should become unlocked
    And newly available skills should be visually highlighted
    And the skill tree connections should update accordingly

  Scenario: Track overall progress
    Given I have completed several skills
    When I view my progress
    Then I should see my total skill points earned
    And I should see completion percentage by category
    And I should see recently completed skills
    And progress should persist between browser sessions