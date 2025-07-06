import {
  Given as baseGiven,
  Then as baseThen,
  When as baseWhen,
  type RegisterStep,
} from "vite-plugin-gherkin";
import { test as base } from "vitest";

interface NumberRepository {
  numbers: Record<string, number>;
}

export const test = base.extend<NumberRepository>({
  numbers: ({}, use) => use({}),
});

export const Given = baseGiven as RegisterStep<NumberRepository>;
export const When = baseWhen as RegisterStep<NumberRepository>;
export const Then = baseThen as RegisterStep<NumberRepository>;
