import path from "path/posix";
import { vitePluginGherkin } from "vite-plugin-gherkin";
import { expect } from "vitest";
import { startVitest } from "vitest/node";

import { Then, When } from "../support/test-context.ts";

When(
  "I run the tests",
  async (
    _,
    { importTestFrom, setupFiles, tempDir, testFiles, testResults },
  ) => {
    testResults.vitest = await startVitest(
      "test",
      [],
      {
        config: false,
        root: tempDir,
        silent: true,
        watch: false,
      },
      {
        plugins: [
          vitePluginGherkin(
            importTestFrom.testFile
              ? { importTestFrom: importTestFrom.testFile }
              : undefined,
          ),
        ],
        test: {
          include: testFiles,
          setupFiles,
        },
      },
    );
  },
);

Then("the tests pass", (_, { testResults }) => {
  const modules = testResults.vitest!.state.getTestModules();
  expect(modules.every((module) => module.ok())).toBe(true);
});

Then("the tests fail", (_, { testResults }) => {
  const modules = testResults.vitest!.state.getTestModules();
  expect(modules.some((module) => module.ok())).toBe(false);
});

Then(
  "the tests fail in {string} on line {int}",
  ([fileName, line], { testResults }) => {
    const moduleId = path.join(testResults.vitest!.config.root, fileName);
    const testModules = testResults.vitest!.state.getTestModules([moduleId]);
    expect(
      testModules[Symbol.iterator]()
        .flatMap((testModule) => testModule.children.allTests("failed"))
        .flatMap((test) => test.result().errors || [])
        .flatMap((error) => error.stacks || [])
        .toArray(),
    ).toContainEqual(expect.objectContaining({ file: moduleId, line }));
  },
);
