import type { Vite } from "vitest/node";

import {
  AstBuilder,
  GherkinClassicTokenMatcher,
  Parser,
} from "@cucumber/gherkin";
import {
  type Background,
  type DataTable,
  type Feature,
  IdGenerator,
  type Location,
  type Rule,
  type Scenario,
  type Step,
} from "@cucumber/messages";
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
    transform(code, id) {
      if (path.extname(id) === ".feature") {
        const gherkinDocument = parser.parse(code);
        if (gherkinDocument.feature) {
          const source = new SourceNode()
            .add(`import { describe, beforeEach } from "vitest";\n`)
            .add(
              `import { test as base } from ${JSON.stringify(importTestFrom)};\n`,
            )
            .add(
              `import { buildTestFunction, DataTable, gherkinContext } from "vite-plugin-gherkin/internal";\n`,
            )
            .add("const test = gherkinContext(base);\n")
            .add(buildFeature(gherkinDocument.feature))
            .toStringWithSourceMap();
          source.map.setSourceContent(id, code);
          return {
            code: source.code,
            map: source.map.toString(),
            moduleSideEffects: true,
          };
        }
      }

      function buildFeature(feature: Feature) {
        return new SourceNode(
          feature.location.line,
          column(feature.location),
          id,
          [
            "describe(",
            JSON.stringify(feature.name),
            ", ({ scoped }) => {\n",
            ...feature.children.map((child) => {
              if (child.rule) {
                return buildRule(child.rule);
              }
              if (child.background) {
                return buildBackground(child.background);
              }
              if (child.scenario) {
                return buildScenario(child.scenario);
              }
              throw new Error("Invalid feature");
            }),
            "});",
          ],
        );
      }

      function buildRule(rule: Rule) {
        return new SourceNode(rule.location.line, column(rule.location), id, [
          "describe(",
          JSON.stringify(rule.name),
          ", () => {\n",
          ...rule.children.map((ruleChild) => {
            if (ruleChild.background) {
              return buildBackground(ruleChild.background);
            }
            if (ruleChild.scenario) {
              return buildScenario(ruleChild.scenario);
            }
            throw new Error("Invalid rule");
          }),
          "});\n",
        ]);
      }

      function buildBackground(background: Background) {
        return new SourceNode(
          background.location.line,
          column(background.location),
          id,
          ["beforeEach(", buildTestFunction(background.steps), ");\n"],
        );
      }

      function buildScenario(scenario: Scenario) {
        return new SourceNode(
          scenario.location.line,
          column(scenario.location),
          id,
          [
            "scoped({ __gherkin_tags: [",
            new SourceNode()
              .add(
                scenario.tags.map(
                  (tag) =>
                    new SourceNode(
                      tag.location.line,
                      column(tag.location),
                      id,
                      JSON.stringify(tag.name),
                    ),
                ),
              )
              .join(","),
            "]});\n",
            "test(",
            JSON.stringify(scenario.name),
            ", ",
            buildTestFunction(scenario.steps),
            ");\n",
          ],
        );
      }

      function buildTestFunction(steps: readonly Step[]) {
        return new SourceNode()
          .add("buildTestFunction(function*(step) {\n")
          .add(
            steps.map(
              (step) =>
                new SourceNode(step.location.line, column(step.location), id, [
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
                          JSON.stringify(rawTable(step.dataTable)),
                          ")",
                        ],
                      )
                    : step.docString
                      ? JSON.stringify(step.docString.content)
                      : "undefined",
                  ");\n",
                ]),
            ),
          )
          .add("})");
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
