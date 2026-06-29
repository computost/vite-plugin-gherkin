import { buildTestFunction, DataTable } from "vite-plugin-gherkin/internal";
import { beforeEach, describe } from "vitest";
import { test } from "vitest";
describe("DocString variations", { tags: [] }, () => {
  test(
    "minimalistic",
    { tags: [] },
    buildTestFunction(function* (step) {
      yield step(
        "a simple DocString",
        "first line (no indent)\n  second line (indented with two spaces)\n\nthird line was empty",
      );
      yield step("a DocString with content type", "<foo>\n  <bar />\n</foo>");
      yield step("a DocString with wrong indentation", "wrongly indented line");
      yield step(
        "a DocString with alternative separator",
        "first line\nsecond line",
      );
      yield step(
        "a DocString with normal separator inside",
        'first line\n"""\nthird line',
      );
      yield step(
        "a DocString with alternative separator inside",
        "first line\n```\nthird line",
      );
      yield step(
        "a DocString with escaped separator inside",
        'first line\n"""\nthird line',
      );
      yield step(
        "a DocString with an escaped alternative separator inside",
        "first line\n```\nthird line",
      );
    }),
  );
});
