import { When } from "./test.ts";

When(
  "I add {string} and {string} into {string}",
  ([augend, addend, sum]: [string, string, string], { numbers }) => {
    numbers[sum] = numbers[augend] + numbers[addend];
  },
);
