import { buildTestFunction, DataTable } from "vite-plugin-gherkin/internal";
import { beforeEach, describe } from "vitest";
import { test } from "vitest";
describe("Background", { tags: [] }, () => {
  beforeEach(
    buildTestFunction(function* (step) {
      yield step("the minimalism inside a background", undefined);
    }),
  );
  test(
    "minimalistic",
    { tags: [] },
    buildTestFunction(function* (step) {
      yield step("the minimalism", undefined);
    }),
  );
  test(
    "also minimalistic",
    { tags: [] },
    buildTestFunction(function* (step) {
      yield step("the minimalism", undefined);
    }),
  );
});
