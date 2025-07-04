import { Given } from "./test";

Given("number {string} is {int}", ([key, value], { numbers }) => {
  numbers[key] = value;
});
