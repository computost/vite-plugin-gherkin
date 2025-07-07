import { expect } from "vitest";

import { Then } from "./test.ts";

Then("{string} equals {int}", ([key, value]: [string, number], { numbers }) => {
  expect(numbers[key]).toBe(value);
});
