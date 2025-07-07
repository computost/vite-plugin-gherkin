import { mkdir, writeFile } from "fs/promises";
import path, { dirname } from "path";

import { Given } from "../support/test-context.ts";

Given(
  "a test context file named {string} with:",
  async ([file, body]: [string, string], { importTestFrom, tempDir }) => {
    const filePath = path.join(tempDir, file);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(path.join(tempDir, file), body);
    importTestFrom.testFile = file;
  },
);

Given(
  "a step file named {string} with:",
  async ([file, body]: [string, string], { setupFiles, tempDir }) => {
    const filePath = path.join(tempDir, file);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(path.join(tempDir, file), body);
    setupFiles.push(file);
  },
);

Given(
  "a feature file named {string} with:",
  async ([file, body]: [string, string], { tempDir, testFiles }) => {
    const filePath = path.join(tempDir, file);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(path.join(tempDir, file), body);
    testFiles.push(file);
  },
);
