Feature: Tags

  Scenario: Tag Scenario
    Given a step file named "features/step-definitions/tag-steps.js" with:
      ```js
      import { Then } from "vite-plugin-gherkin";
      import { expect } from "vitest";

      Then("the task is tagged with {string}", ([expected], { task }) => {
        expect(task.meta.tags).toContain(expected);
      });
      ```
    And a feature file named "features/a.feature" with:
      ```gherkin
      Feature: Tag sample

        @my-tag
        Scenario: This scenario is tagged
          Then the task is tagged with "@my-tag"
      ```
    When I run the tests
    Then the tests pass

  Scenario: Tag Feature
    Given a step file named "features/step-definitions/tag-steps.js" with:
      ```js
      import { Then } from "vite-plugin-gherkin";
      import { expect } from "vitest";

      Then("the task is tagged with {string}", ([expected], { task }) => {
        expect(task.meta.tags).toContain(expected);
      });
      ```
    And a feature file named "features/a.feature" with:
      ```gherkin
      @my-tag
      Feature: Tag sample

        Scenario: This scenario is tagged
          Then the task is tagged with "@my-tag"
      ```
    When I run the tests
    Then the tests pass
