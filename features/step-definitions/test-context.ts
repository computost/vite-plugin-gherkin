import { test as base } from "vitest";
import {
  Given as baseGiven,
  When as baseWhen,
  Then as baseThen,
  type RegisterStep,
} from "vite-plugin-gherkin";
import { Vitest } from "vitest/node";

interface VitestConfiguration {
  setupFiles: string[];
  virutalTestFiles: { fileName: string; file: string }[];
  importTestFrom: { testFile?: string };
  testResults: { vitest?: Vitest };
}

export const test = base.extend<VitestConfiguration>({
  setupFiles: ({}, use) => use([]),
  virutalTestFiles: ({}, use) => use([]),
  importTestFrom: ({}, use) => use({}),
  testResults: ({}, use) => use({}),
});

export const Given = baseGiven as RegisterStep<VitestConfiguration>;
export const When = baseWhen as RegisterStep<VitestConfiguration>;
export const Then = baseThen as RegisterStep<VitestConfiguration>;
