import { Given } from "./test.ts";

Given("number {string} is {int}", ([key, value], { numbers }) => {
  numbers[key] = value;
});
