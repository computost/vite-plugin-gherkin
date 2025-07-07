Feature: Core feature elements execution
  In order to have automated acceptance tests
  As a developer
  I want Cucumber to run core feature elements

  Scenario: simple
    Given a feature file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario:
          Given a step passes
          When a step passes
          Then a step passes
      """
    And a step file named "features/step-definitions/passing-step.js" with:
      ```js
      import { Given } from "vite-plugin-gherkin";

      Given(/^a step passes$/, () => {});
      ```
    When I run the tests
    Then the tests pass

  Scenario: Given, When, Then, And and But steps
    Given a feature file named "features/a.feature" with:
      """
      Feature: Given, When, Then, And and But step execution
        Scenario: All kinds of steps
          Given a "Given" step passes
          When a "When" step passes
          Then a "Then" step passes

        Scenario: All kinds of steps with And's and But's
          Given a "Given" step passes
          And a "Given" step passes
          But a "Given" step passes
          When a "When" step passes
          And a "When" step passes
          But a "When" step passes
          Then a "Then" step passes
          And a "Then" step passes
          But a "Then" step passes
      """
    And a step file named "features/step-definitions/passing-steps.js" with:
      ```js
      import { Given, Then, When } from "vite-plugin-gherkin";

      Given(/^a "Given" step passes$/, function() {})
      When(/^a "When" step passes$/, function() {})
      Then(/^a "Then" step passes$/, function() {})
      ```
    When I run the tests
    Then the tests pass

  Scenario: Step definition body is executed
    Given a feature file named "features/a.feature" with:
      """
      Feature: Step definition body execution
        Scenario: Step definition body is executed once
          When I call a watched step
          Then the watched step should have been called 1 time

        Scenario: Step definition body is executed several times
          When I call a watched step
          And I call a watched step
          And I call a watched step
          Then the watched step should have been called 3 times
      """
    And a test context file named "features/support/test.js" with:
      ```js
      import { test as base } from "vitest";

      export const test = base.extend({
        counter: ({}, use) => use({ count: 0 })
      });
      ```
    And a step file named "features/step-definitions/watched-steps.js" with:
      ```js
      import { When, Then } from "vite-plugin-gherkin";
      import { expect } from "vitest";

      When(/^I call a watched step$/, function(_, { counter }) {
        counter.count += 1;
      });

      Then(/^the watched step should have been called (\d+) times?$/, (count, { counter }) => {
        expect(counter.count).toBe(parseInt(count));
      })
      ```
    When I run the tests
    Then the tests pass

  Scenario: Steps accepting parameters
    Given a feature file named "features/a.feature" with:
      """
      Feature: Steps receiving parameters
        Scenario: Single-parameter step
          When I call a step with "a parameter"
          Then the 1st received parameter should be "a parameter"

        Scenario: Three-parameter step
          When I call a step with "one", "two" and "three"
          Then the 1st received parameter should be "one"
          And the 2nd received parameter should be "two"
          And the 3rd received parameter should be "three"
      """
    And a test context file named "features/support/test.js" with:
      ```js
      import { test as base } from "vitest";

      export const test = base.extend({
        parameters: ({}, use) => use({})
      });
      ```
    And a step file named "features/step-definitions/parameter-steps.js" with:
      ```js
      import { When, Then } from "vite-plugin-gherkin";
      import { expect } from "vitest";

      When(/^I call a step with "([^"]*)"$/, ([arg], { parameters }) => {
        parameters['1'] = arg
      });

      When(/^I call a step with "([^"]*)", "([^"]*)" and "([^"]*)"$/,
        ([arg1, arg2, arg3], { parameters }) => {
          parameters['1'] = arg1;
          parameters['2'] = arg2;
          parameters['3'] = arg3;
      });

      Then(/^the (\d+)(?:st|nd|rd) received parameter should be "([^"]*)"$/,
        ([index, arg], { parameters }) => {
          expect(parameters[index]).toBe(arg);
      });
      ```
    When I run the tests
    Then the tests pass
