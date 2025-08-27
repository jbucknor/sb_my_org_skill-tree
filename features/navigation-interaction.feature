Feature: Navigation and Interaction
  As a user exploring my skill tree
  I want to easily navigate and interact with the skill tree
  So that I can efficiently manage my personal development

  Background:
    Given the skill tree application is loaded
    And the skill tree is displayed

  Scenario: Pan around large skill tree
    Given the skill tree extends beyond the visible area
    When I drag on the canvas background
    Then the skill tree should pan smoothly
    And I should be able to view different areas
    And pan boundaries should prevent excessive scrolling

  Scenario: Zoom in and out of skill tree
    Given I am viewing the skill tree
    When I use the zoom controls or mouse wheel
    Then the skill tree should zoom in or out appropriately
    And skill nodes should remain clear and readable
    And zoom should be centered on the current focus area

  Scenario: Keyboard navigation support
    Given I am using keyboard navigation
    When I press Tab to navigate
    Then focus should move between skill nodes logically
    And focused nodes should have clear visual indicators
    And I should be able to activate skills using Enter or Space

  Scenario: Touch interaction on mobile devices
    Given I am using a mobile device
    When I touch and drag on the skill tree
    Then the tree should pan smoothly
    And I should be able to tap skill nodes to select them
    And pinch gestures should control zoom level
    And touch targets should be appropriately sized

  Scenario: Search and filter skills
    Given I want to find specific skills
    When I use a search function
    Then I should be able to search by skill name
    And I should be able to filter by category
    And matching skills should be highlighted
    And non-matching skills should be dimmed

  Scenario: Quick navigation between categories
    Given I want to jump between skill categories
    When I use category navigation controls
    Then I should be able to quickly jump to any category
    And the view should center on the selected category
    And the transition should be smooth and oriented