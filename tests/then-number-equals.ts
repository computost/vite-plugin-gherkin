import { expect } from "vitest";
import { Then } from "./test";

Then("{string} equals {int}", ([key, value], { numbers }) => {
  expect(numbers[key]).toBe(value);
});
