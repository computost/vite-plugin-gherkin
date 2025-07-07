import { Given } from "./test.ts";

Given(
  "number {string} is {int}",
  ([key, value]: [string, number], { numbers }) => {
    numbers[key] = value;
  },
);
