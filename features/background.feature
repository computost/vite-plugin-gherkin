Feature: Background
  Background allows you to add some context to the scenarios in a
  single feature. A Background is much like a scenario containing a
  number of steps. The difference is when it is run. The background is
  run before each of your scenarios but after any of your Before
  Hooks.

  Background:
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

  Scenario: One scenario and a background
    Given a feature file named "features/add-numbers.feature" with:
      ```gherkin
      Feature: Add numbers

        Background:
          Given number "a" is 5

        Scenario: a + b = c
          Given number "b" is 2
          When I add "a" and "b" into "c"
          Then "c" equals 7
      ```
    When I run the tests
    Then the tests pass

  Scenario: Two scenarios and a background
    Given a feature file named "features/add-numbers.feature" with:
      ```gherkin
      Feature: Add numbers

        Background:
          Given number "a" is 5

        Scenario: a + b = c
          Given number "b" is 2
          When I add "a" and "b" into "c"
          Then "c" equals 7

        Scenario: a + b = c
          Given number "b" is 8
          When I add "a" and "b" into "c"
          Then "c" equals 13
      ```
    When I run the tests
    Then the tests pass

  Scenario: Two examples within a rule with a background, plus a feature-level background
    Given a feature file named "features/add-numbers.feature" with:
      ```gherkin
      Feature: a feature

        Background:
          Given number "a" is 5

        Rule: a rule

          Background:
            Given number "b" is 2

          Example: first example
            When I add "a" and "b" into "c"
            Then "c" equals 7

          Example: second example
            When I add "a" and "b" into "c"
            And I add "b" and "c" into "d"
            Then "d" equals 9
      ```
    When I run the tests
    Then the tests pass
