Feature: Data Tables

  Scenario: raw
    Given a feature file named "features/table.feature" with:
      ```gherkin
      Feature: a feature

        Scenario: a scenario
          Given a table step
            | Cucumber     | Cucumis sativus |
            | Burr Gherkin | Cucumis anguria |
      ```
    And a step file named "features/step-definitions/table-steps.js" with:
      ```js
      import { Given } from "vite-plugin-gherkin";
      import { expect } from "vitest";

      Given(/^a table step$/, ([table])  => {
        expect(table.raw()).toEqual([
          ['Cucumber', 'Cucumis sativus'],
          ['Burr Gherkin', 'Cucumis anguria']
        ]);
      })
      ```
    When I run the tests
    Then the tests pass

  Scenario: rows
    Given a feature file named "features/table.feature" with:
      ```gherkin
      Feature: a feature

        Scenario: a scenario
          Given a table step
            | Vegetable | Rating |
            | Apricot   | 5      |
            | Broccoli  | 2      |
            | Cucumber  | 10     |
      ```
    And a step file named "features/step-definitions/table-step.js" with:
      ```js
      import { Given } from "vite-plugin-gherkin";
      import { expect } from "vitest";

      Given(/^a table step$/, ([table]) => {
        expect(table.rows()).toEqual([
          ['Apricot', '5'],
          ['Broccoli', '2'],
          ['Cucumber', '10']
        ]);
      });
      ```
    When I run the tests
    Then the tests pass

  Scenario: rowsHash
    Given a feature file named "features/table.feature" with:
      ```gherkin
      Feature: a feature

        Scenario: a scenario
          Given a table step
            | Cucumber     | Cucumis sativus |
            | Burr Gherkin | Cucumis anguria |
      ```
    And a step file named "features/step-definitions/table-steps.js" with:
      ```js
      import { Given } from "vite-plugin-gherkin";
      import { expect } from "vitest";

      Given(/^a table step$/, ([table]) => {
        expect(table.rowsHash()).toEqual({
          'Cucumber': 'Cucumis sativus',
          'Burr Gherkin': 'Cucumis anguria'
        });
      });
      ```
    When I run the tests
    Then the tests pass

  Scenario: hashes
    Given a feature file named "features/table.feature" with:
      ```gherkin
      Feature: a feature

        Scenario: a scenario
          Given a table step
            | Vegetable | Rating |
            | Apricot   | 5      |
            | Broccoli  | 2      |
            | Cucumber  | 10     |
      ```
    Given a step file named "features/step-definitions/table-steps.js" with:
      ```js
      import { Given } from "vite-plugin-gherkin";
      import { expect } from "vitest";

      Given(/^a table step$/, ([table]) => {
        expect(table.hashes()).toEqual([
          {'Vegetable': 'Apricot', 'Rating': '5'},
          {'Vegetable': 'Broccoli', 'Rating': '2'},
          {'Vegetable': 'Cucumber', 'Rating': '10'}
        ]);
      });
      ```
    When I run the tests
    Then the tests pass
