import { mkdir, writeFile } from "fs/promises";
import path, { dirname } from "path";

import { Given } from "../support/test-context.ts";

Given<[string]>(
  "a test context file named {string} with:",
  async ([file, body], { importTestFrom, tempDir }) => {
    const filePath = path.join(tempDir, file);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(path.join(tempDir, file), body as string);
    importTestFrom.testFile = file;
  },
);

Given<[string]>(
  "a step file named {string} with:",
  async ([file, body], { setupFiles, tempDir }) => {
    const filePath = path.join(tempDir, file);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(path.join(tempDir, file), body as string);
    setupFiles.push(file);
  },
);

Given<[string]>(
  "a feature file named {string} with:",
  async ([file, body], { tempDir, testFiles }) => {
    const filePath = path.join(tempDir, file);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(path.join(tempDir, file), body as string);
    testFiles.push(file);
  },
);
