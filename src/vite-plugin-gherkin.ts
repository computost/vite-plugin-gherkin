import type { Vite } from "vitest/node";

import {
  AstBuilder,
  GherkinClassicTokenMatcher,
  Parser,
} from "@cucumber/gherkin";
import { type DataTable, IdGenerator, type Location } from "@cucumber/messages";
import path from "path";
import { SourceNode } from "source-map-generator";

const defaultConfig = {
  importTestFrom: "vitest",
};

export function vitePluginGherkin({
  importTestFrom = defaultConfig.importTestFrom,
}: Partial<typeof defaultConfig> = defaultConfig): Vite.Plugin {
  const uuidFn = IdGenerator.uuid();

  const builder = new AstBuilder(uuidFn);
  const matcher = new GherkinClassicTokenMatcher();
  const parser = new Parser(builder, matcher);

  return {
    name: "vite-plugin-gherkin",
    async transform(code, id) {
      if (path.extname(id) === ".feature") {
        const gherkinDocument = parser.parse(code);
        if (gherkinDocument.feature) {
          const source = new SourceNode()
            .add(`import { describe } from "vitest";\n`)
            .add(`import { test } from ${JSON.stringify(importTestFrom)};\n`)
            .add(
              `import { buildTestFunction, DataTable } from "vite-plugin-gherkin/internal";\n`,
            )
            .add(
              new SourceNode(
                gherkinDocument.feature.location.line,
                column(gherkinDocument.feature.location),
                id,
                [
                  "describe(",
                  JSON.stringify(gherkinDocument.feature.name),
                  ", () => {\n",
                  ...gherkinDocument.feature.children.map((child) => {
                    if (child.scenario) {
                      return new SourceNode(
                        child.scenario.location.line,
                        column(child.scenario.location),
                        id,
                        [
                          "test(",
                          JSON.stringify(child.scenario.name),
                          ", buildTestFunction(function*(step) {\n",
                          ...child.scenario.steps.map(
                            (step) =>
                              new SourceNode(
                                step.location.line,
                                column(step.location),
                                id,
                                [
                                  "yield step(",
                                  JSON.stringify(step.text),
                                  ",",
                                  step.dataTable
                                    ? new SourceNode(
                                        step.dataTable.location.line,
                                        column(step.dataTable.location),
                                        id,
                                        [
                                          "new DataTable(",
                                          JSON.stringify(
                                            rawTable(step.dataTable),
                                          ),
                                          ")",
                                        ],
                                      )
                                    : step.docString
                                      ? JSON.stringify(step.docString.content)
                                      : "undefined",
                                  ");\n",
                                ],
                              ),
                          ),
                          "}));\n",
                        ],
                      );
                    }
                    throw new Error("Not Implemented");
                  }),
                  "});",
                ],
              ),
            )
            .toStringWithSourceMap();
          source.map.setSourceContent(id, code);
          return {
            code: source.code,
            map: source.map.toString(),
            moduleSideEffects: true,
          };
        }
      }
    },
  };
}

function column(location: Location) {
  return location.column !== undefined ? location.column - 1 : null;
}

function rawTable(dataTable: DataTable): string[][] {
  return dataTable.rows.map((row) => row.cells.map((cell) => cell.value));
}
