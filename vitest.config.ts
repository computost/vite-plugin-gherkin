import { glob } from "glob";
import path from "path";
import { vitePluginGherkin } from "vite-plugin-gherkin";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    vitePluginGherkin({
      importTestFrom: path.resolve(
        __dirname,
        "./features/step-definitions/test-context.ts",
      ),
    }),
  ],
  test: {
    include: ["features/**/*.feature"],
    setupFiles: await glob("features/**/*.ts"),
  },
});
