import { When } from "./test.ts";

When(
  "I add {string} and {string} into {string}",
  ([augend, addend, sum], { numbers }) => {
    numbers[sum] = numbers[augend] + numbers[addend];
  },
);
