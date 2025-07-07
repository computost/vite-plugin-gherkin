import fs from "fs/promises";
import path from "path";
import {
  Given as baseGiven,
  Then as baseThen,
  When as baseWhen,
  type RegisterStep,
} from "vite-plugin-gherkin";
import { test as base } from "vitest";
import { Vitest } from "vitest/node";

export interface VitestConfiguration {
  importTestFrom: { testFile?: string };
  setupFiles: string[];
  tempDir: string;
  testFiles: string[];
  testResults: { vitest?: Vitest };
}

export const test = base.extend<VitestConfiguration>({
  importTestFrom: ({}, use) => use({}),
  setupFiles: ({}, use) => use([]),
  tempDir: async ({ task }, use) => {
    const tempDir = path.join(".temp", task.id);
    await fs.mkdir(tempDir, { recursive: true });
    await use(tempDir);
    await fs.rm(tempDir, { force: true, recursive: true });
  },
  testFiles: ({}, use) => use([]),
  testResults: ({}, use) => use({}),
});

export const Given = baseGiven as RegisterStep<VitestConfiguration>;
export const When = baseWhen as RegisterStep<VitestConfiguration>;
export const Then = baseThen as RegisterStep<VitestConfiguration>;
