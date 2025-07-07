import {
  Given as baseGiven,
  Then as baseThen,
  When as baseWhen,
  type RegisterStep,
} from "vite-plugin-gherkin";
import { test as base } from "vitest";
import { Vitest } from "vitest/node";

interface VitestConfiguration {
  importTestFrom: { testFile?: string };
  setupFiles: string[];
  testResults: { vitest?: Vitest };
  virtualTestFiles: { file: string; fileName: string }[];
}

export const test = base.extend<VitestConfiguration>({
  importTestFrom: ({}, use) => use({}),
  setupFiles: ({}, use) => use([]),
  testResults: ({}, use) => use({}),
  virtualTestFiles: ({}, use) => use([]),
});

export const Given = baseGiven as RegisterStep<VitestConfiguration>;
export const When = baseWhen as RegisterStep<VitestConfiguration>;
export const Then = baseThen as RegisterStep<VitestConfiguration>;
