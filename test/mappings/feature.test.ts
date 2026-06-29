import { buildTestFunction, DataTable } from "vite-plugin-gherkin/internal";
import { beforeEach, describe } from "vitest";
import { test } from "vitest";
describe("Minimal", { tags: [] }, () => {
  test(
    "minimalistic",
    { tags: [] },
    buildTestFunction(function* (step) {
      yield step("the minimalism", undefined);
    }),
  );
});
