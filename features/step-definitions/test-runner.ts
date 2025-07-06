import { Given, Then, When } from "./test-context.ts";
import { startVitest } from "vitest/node";
import { expect } from "vitest";
import { vitePluginGherkin } from "vite-plugin-gherkin";

Given(
  "a feature file named {string}:",
  ([fileName, file]: [string, string], { virutalTestFiles }) => {
    virutalTestFiles.push({ fileName, file });
  },
);

When(
  "I run the tests",
  async (_, { setupFiles, virutalTestFiles, testResults, importTestFrom }) => {
    testResults.vitest = await startVitest(
      "test",
      [],
      {
        config: false,
        watch: false,
        silent: true,
      },
      {
        plugins: [
          {
            name: "virtual-test-files",
            enforce: "pre",
            load(id) {
              if (id === "virtual:test-files") {
                return virutalTestFiles
                  .map(({ fileName }) => `import "${fileName}";`)
                  .join("\n");
              }
              const virtualTestFile = virutalTestFiles.find(
                ({ fileName }) => fileName === id,
              );
              if (virtualTestFile) {
                return virtualTestFile.file;
              }
            },
          },
          vitePluginGherkin(
            importTestFrom.testFile
              ? { importTestFrom: importTestFrom.testFile }
              : undefined,
          ),
        ],
        test: {
          setupFiles,
          include: ["tests/load-virtual-test-files.ts"],
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
