import { buildTestFunction, DataTable } from "vite-plugin-gherkin/internal";
import { beforeEach, describe } from "vitest";
import { test } from "vitest";
describe("Some rules", { tags: [] }, () => {
  beforeEach(
    buildTestFunction(function* (step) {
      yield step("fb", undefined);
    }),
  );
  describe("A", () => {
    beforeEach(
      buildTestFunction(function* (step) {
        yield step("ab", undefined);
      }),
    );
    test(
      "Example A",
      { tags: [] },
      buildTestFunction(function* (step) {
        yield step("a", undefined);
      }),
    );
  });
  describe("B", () => {
    test(
      "Example B",
      { tags: [] },
      buildTestFunction(function* (step) {
        yield step("b", undefined);
      }),
    );
  });
});
