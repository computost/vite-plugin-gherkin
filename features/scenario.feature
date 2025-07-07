Feature: Scenario

  Scenario: Simple Scenario
    Given a test context file named "numbers.js" with:
      ```js
      import { test as base } from "vitest";

      export const test = base.extend({
        numbers: ({}, use) => use({}),
      });
      ```
    And a step file named "features/step-definitions/number-steps.js" with:
      ```js
      import { Given, When, Then } from "vite-plugin-gherkin";
      import { expect } from "vitest";

      Given(
        "number {string} is {int}",
        ([key, value], { numbers }) => {
          numbers[key] = value;
        },
      );

      When(
        "I add {string} and {string} into {string}",
        ([augend, addend, sum], { numbers }) => {
          numbers[sum] = numbers[augend] + numbers[addend];
        },
      );


      Then("{string} equals {int}", ([key, value], { numbers }) => {
        expect(numbers[key]).toBe(value);
      });
      ```
    And a feature file named "features/add-numbers.feature" with:
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
    Given a feature file named "features/missing-step.feature" with:
      ```
      Feature: Do nothing
        Scenario: nothing
          When I try to do something
          Then nothing happens
      ```
    When I run the tests
    Then the tests fail
