import { glob } from "glob";
import path from "path";
import { defineConfig } from "vitest/config";

import { vitePluginGherkin } from "./src/vite-plugin-gherkin.ts";

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [
          vitePluginGherkin({
            importTestFrom: path.resolve(
              __dirname,
              "./features/support/test-context.ts",
            ),
          }),
        ],
        test: {
          include: ["features/**/*.feature"],
          name: "features",
          setupFiles: await glob("features/step-definitions/**/*.ts"),
          strictTags: false,
        },
      },
      {
        test: {
          dir: "test",
          exclude: ["mappings/**"],
          name: "mappings",
        },
      },
    ],
    watchTriggerPatterns: [
      {
        pattern: /test\/mappings\/.*/,
        testsToRun: () => "test/mappings.test.ts",
      },
    ],
  },
});
