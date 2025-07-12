Feature: Rule keyword

  Background:
    Given a test context file named "highlander.js" with:
      ```js
      import { test as base } from "vitest";

      export const test = base.extend({
        highlander: ({}, use) => use({ total: 0, living: 0, deaths: 0 })
      });
      ```

  Scenario: Rule with background and multiple examples, passing
    Given a feature file named "features/highlander.feature" with:
      ```gherkin
      Feature: Highlander

        Rule: There can be only One

          Background:
            Given there are 3 ninjas

          Example: Only One -- More than one alive
            Given there are more than one ninja alive
            When 2 ninjas meet, they will fight
            Then one ninja dies
            And there is one ninja less alive

          Example: Only One -- One alive
            Given there is only 1 ninja alive
            Then they will live forever
      ```
    And a step file named "features/step_definitions/cucumber_steps.js" with:
      ```js
      import { Given, When, Then } from "vite-plugin-gherkin";

      Given('there are {int} ninjas', ([count], { highlander }) => {
        highlander.total = count;
      });

      Given('there is only 1 ninja alive', ([], { highlander }) => {
        highlander.living = 1;
      });

      Given('there are more than one ninja alive', ([], { highlander }) => {
        highlander.living = 2;
      });

      When('2 ninjas meet, they will fight', ([], { highlander }) => {
        highlander.deaths = 1
        highlander.living = 1
      });

      Then('one ninja dies', () => {});

      Then('there is one ninja less alive', () => {});

      Then('they will live forever', () => {});
      ```
    When I run the tests
    Then the tests pass

  Scenario: Rule with background and multiple examples, failing
    Given a feature file named "features/highlander.feature" with:
      ```gherkin
      Feature: Highlander

        Rule: There can be only One

          Background:
            Given there are 3 ninjas

          Example: Only One -- More than one alive
            Given there are more than one ninja alive
            When 2 ninjas meet, they will fight
            Then one ninja dies
            And there is one ninja less alive

          Example: Only One -- One alive
            Given there is only 1 ninja alive
            Then they will live forever
      ```
    And a step file named "features/step_definitions/cucumber_steps.js" with:
      ```js
      import { Given, When, Then } from "vite-plugin-gherkin";

      Given('there are {int} ninjas', ([count], { highlander }) => {
        highlander.total = count;
      });

      Given('there is only 1 ninja alive', ([], { highlander }) => {
        highlander.living = 1;
      });

      Given('there are more than one ninja alive', ([], { highlander }) => {
        highlander.living = 2;
      });

      When('2 ninjas meet, they will fight', ([], { highlander }) => {
        highlander.deaths = 1
        highlander.living = 1
      });

      Then('one ninja dies', () => {
        throw 'fail';
      });

      Then('there is one ninja less alive', () => {});

      Then('they will live forever', () => {});
      ```
    When I run the tests
    Then the tests fail
