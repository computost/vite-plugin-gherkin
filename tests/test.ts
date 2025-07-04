import { test as base } from "vitest";
import {
  Given as baseGiven,
  When as baseWhen,
  Then as baseThen,
  type RegisterStep,
} from "vite-plugin-gherkin";

interface NumberRepository {
  numbers: Record<string, number>;
}

export const test = base.extend<NumberRepository>({
  numbers: ({}, use) => use({}),
});

export const Given = baseGiven as RegisterStep<NumberRepository>;
export const When = baseWhen as RegisterStep<NumberRepository>;
export const Then = baseThen as RegisterStep<NumberRepository>;
