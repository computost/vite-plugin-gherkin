import { vitePluginGherkin } from "vite-plugin-gherkin";
import { expect } from "vitest";
import { startVitest } from "vitest/node";

import { Given, Then, When } from "./test-context.ts";

Given(
  "a feature file named {string}:",
  ([fileName, file]: [string, string], { virtualTestFiles }) => {
    virtualTestFiles.push({ file, fileName });
  },
);

When(
  "I run the tests",
  async (_, { importTestFrom, setupFiles, testResults, virtualTestFiles }) => {
    testResults.vitest = await startVitest(
      "test",
      [],
      {
        config: false,
        silent: true,
        watch: false,
      },
      {
        plugins: [
          {
            enforce: "pre",
            load(id) {
              if (id === "virtual:test-files") {
                return virtualTestFiles
                  .map(({ fileName }) => `import "${fileName}";`)
                  .join("\n");
              }
              const virtualTestFile = virtualTestFiles.find(
                ({ fileName }) => fileName === id,
              );
              if (virtualTestFile) {
                return virtualTestFile.file;
              }
            },
            name: "virtual-test-files",
          },
          vitePluginGherkin(
            importTestFrom.testFile
              ? { importTestFrom: importTestFrom.testFile }
              : undefined,
          ),
        ],
        test: {
          include: ["tests/load-virtual-test-files.ts"],
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
