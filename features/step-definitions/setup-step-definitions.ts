import path from "path";
import { Given } from "./test-context.ts";

Given("a test context with a number repository", ([], { importTestFrom }) => {
  importTestFrom.testFile = path.resolve(__dirname, "../../tests/test.ts");
});

Given("a Given step that stores a number", ([], { setupFiles }) => {
  setupFiles.push(path.resolve(__dirname, "../../tests/given-store-number.ts"));
});

Given("a When step that adds 2 numbers", ([], { setupFiles }) => {
  setupFiles.push(path.resolve(__dirname, "../../tests/when-add-numbers.ts"));
});

Given(
  "a Then step that asserts a number equals a value",
  ([], { setupFiles }) => {
    setupFiles.push(
      path.resolve(__dirname, "../../tests/then-number-equals.ts")
    );
  }
);

Given("a Given step that passes", ([], { setupFiles }) => {
  setupFiles.push(path.resolve(__dirname, "../../tests/given-pass.ts"));
});

Given("passing Given When Then steps", ([], { setupFiles }) => {
  setupFiles.push(
    path.resolve(__dirname, "../../tests/passing-given-when-then-steps.ts")
  );
});
