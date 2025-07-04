Feature: Scenario
  Scenario: Simple Scenario
    Given a test context with a number repository
    And a Given step that stores a number
    And a When step that adds 2 numbers
    And a Then step that asserts a number equals a value
    And a feature file named "add-numbers.feature":
      ```
      Feature: Add numbers
          Scenario: a + b = c
              Given number "a" is 5
              And number "b" is 2
              When I add "a" and "b" into "c"
              Then "c" equals 7
      ```
    When I run the tests
    Then the tests pass

  Scenario: Missing step
    Given a feature file named "missing-step.feature":
      ```
      Feature: Do nothing
        Scenario: nothing
          When I try to do something
          Then nothing happens
      ```
    When I run the tests
    Then the tests fail