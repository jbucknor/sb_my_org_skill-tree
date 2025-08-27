Feature: Skill Tree Display
  As a user seeking personal development
  I want to see an interactive skill tree visualization
  So that I can understand available skills and my progress

  Background:
    Given the skill tree application is loaded
    And the skill tree data is available

  Scenario: Display basic skill tree structure
    Given I am on the skill tree page
    When the page loads completely
    Then I should see a canvas element for the skill tree
    And I should see skill nodes for all 7 life categories
    And each category should have distinct visual styling

  Scenario: Display skill categories
    Given I am on the skill tree page
    When the skill tree renders
    Then I should see the "Family" skill category
    And I should see the "Business" skill category  
    And I should see the "Relationships" skill category
    And I should see the "Health" skill category
    And I should see the "Finances" skill category
    And I should see the "Spirituality" skill category
    And I should see the "Emotions" skill category

  Scenario: Show skill nodes within categories
    Given I am on the skill tree page
    And the skill tree has loaded
    When I view the Family category
    Then I should see individual skill nodes
    And each skill node should have a name
    And each skill node should show completion status
    And skill nodes should be connected with lines

  Scenario: Responsive design on different screen sizes
    Given I am on the skill tree page
    When I resize the browser to mobile width (320px)
    Then the skill tree should remain fully functional
    And all skill nodes should be accessible
    And the canvas should fit the screen properly

  Scenario: Canvas interaction capabilities
    Given I am on the skill tree page
    And the skill tree is displayed
    When I hover over a skill node
    Then I should see a tooltip with skill information
    And the node should provide visual feedback