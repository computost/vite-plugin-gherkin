import { glob } from "glob";
import path from "path";
import { vitePluginGherkin } from "vite-plugin-gherkin";
import { defineConfig } from "vitest/config";

export default defineConfig({
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
    sequence: {
      concurrent: true,
    },
    setupFiles: await glob("features/step-definitions/**/*.ts"),
  },
});
