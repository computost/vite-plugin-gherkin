import remapping from "@jridgewell/remapping";
import { Linter } from "eslint";
import { glob, readFile } from "fs/promises";
import MagicString from "magic-string";
import path from "path";
import { describe, expect, test } from "vitest";

import config from "../eslint.config.ts";
import { createTransformer } from "../src/create-transformer.ts";

const mappingsPath = path.resolve(__dirname, "mappings");

const transformer = createTransformer("vitest");
const linter = new Linter();

describe(".feature => .test.ts mappings", async () => {
  const gherkinFiles = await Array.fromAsync(
    glob("*.feature", {
      cwd: mappingsPath,
    }),
  );
  test.for(gherkinFiles)("maps %s", async (gherkinFile) => {
    const source = await readFile(path.resolve(mappingsPath, gherkinFile), {
      encoding: "utf-8",
    });
    const basename = path.basename(gherkinFile, ".feature");
    const transformedCode = transformer(gherkinFile, source);

    if (transformedCode) {
      const { code, map } = transformedCode;

      const formattedCode = fixEslint(
        code,
        `${basename}.test.ts`,
        JSON.stringify(map),
      );

      await expect(formattedCode.code).toMatchFileSnapshot(
        path.join("mappings", `${basename}.test.ts`),
      );
      await expect(formattedCode.sourceMap).toMatchFileSnapshot(
        path.join("mappings", `${basename}.test.ts.map`),
      );
    }
  });
});

function fixEslint(code: string, fileName: string, sourceMap: string) {
  let lintMessages = linter.verify(code, config);
  const sourceMaps = [sourceMap];
  let depth = 0;
  while (lintMessages.some((lintMessage) => !!lintMessage.fix)) {
    const s = new MagicString(code, { filename: fileName });
    lintMessages.forEach((lintMessage) => {
      const { fix } = lintMessage;
      if (fix) {
        if (fix.range[0] === fix.range[1]) {
          s.appendLeft(fix.range[0], fix.text);
        } else {
          s.overwrite(fix.range[0], fix.range[1], fix.text, true);
        }
      }
    });
    code = s.toString();
    sourceMaps.unshift(
      s
        .generateMap({
          file: fileName,
          source: `passthrough${++depth}`,
        })
        .toString(),
    );
    lintMessages = linter.verify(code, config);
  }
  sourceMap = remapping(sourceMaps, () => null).toString();
  return { code, sourceMap };
}
