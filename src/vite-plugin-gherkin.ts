import type { Vite } from "vitest/node";

import path from "path";

import { createTransformer } from "./create-transformer.ts";

const defaultConfig = {
  importTestFrom: "vitest",
};

export function vitePluginGherkin({
  importTestFrom = defaultConfig.importTestFrom,
}: Partial<typeof defaultConfig> = defaultConfig): Vite.Plugin {
  const transform = createTransformer(importTestFrom);

  return {
    name: "vite-plugin-gherkin",
    transform(code, id) {
      if (path.extname(id) === ".feature") {
        const transformedGherkin = transform(id, code);
        if (transformedGherkin) {
          return {
            code: transformedGherkin.code,
            map: JSON.stringify(transformedGherkin.map),
            moduleSideEffects: true,
          };
        }
      }
    },
  };
}
