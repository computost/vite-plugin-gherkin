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
  type Tag,
} from "@cucumber/messages";
import { SourceNode } from "source-map-generator";

const uuidFn = IdGenerator.uuid();

const builder = new AstBuilder(uuidFn);
const matcher = new GherkinClassicTokenMatcher();
const parser = new Parser(builder, matcher);

export const createTransformer = (importTestFrom: string) =>
  function transform(fileName: string, code: string) {
    const gherkinDocument = parser.parse(code);
    if (gherkinDocument.feature) {
      const source = new SourceNode()
        .add(`import { describe, beforeEach } from "vitest";\n`)
        .add(`import { test } from ${JSON.stringify(importTestFrom)};\n`)
        .add(
          `import { buildTestFunction, DataTable } from "vite-plugin-gherkin/internal";\n`,
        )
        .add(buildFeature(gherkinDocument.feature))
        .toStringWithSourceMap();
      source.map.setSourceContent(fileName, code);
      return {
        code: source.code,
        map: source.map.toJSON(),
      };
    }
    return null;

    function buildFeature(feature: Feature) {
      return new SourceNode(
        feature.location.line,
        column(feature.location),
        fileName,
        [
          "describe(",
          JSON.stringify(feature.name),
          ", ",
          buildTagsArgument(feature.tags),
          ", () => {\n",
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
      return new SourceNode(
        rule.location.line,
        column(rule.location),
        fileName,
        [
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
        ],
      );
    }

    function buildBackground(background: Background) {
      return new SourceNode(
        background.location.line,
        column(background.location),
        fileName,
        ["beforeEach(", buildTestFunction(background.steps), ");\n"],
      );
    }

    function buildScenario(scenario: Scenario) {
      return new SourceNode(
        scenario.location.line,
        column(scenario.location),
        fileName,
        [
          "test(",
          JSON.stringify(scenario.name),
          ", ",
          buildTagsArgument(scenario.tags),
          ", ",
          buildTestFunction(scenario.steps),
          ");\n",
        ],
      );
    }

    function buildTagsArgument(tags: readonly Tag[]) {
      return new SourceNode()
        .add("{ tags: [")
        .add(
          new SourceNode()
            .add(
              tags.map(
                (tag) =>
                  new SourceNode(
                    tag.location.line,
                    column(tag.location),
                    fileName,
                    JSON.stringify(tag.name),
                  ),
              ),
            )
            .join(","),
        )
        .add("] }");
    }

    function buildTestFunction(steps: readonly Step[]) {
      return new SourceNode()
        .add("buildTestFunction(function*(step) {\n")
        .add(
          steps.map(
            (step) =>
              new SourceNode(
                step.location.line,
                column(step.location),
                fileName,
                [
                  "yield step(",
                  JSON.stringify(step.text),
                  ",",
                  step.dataTable
                    ? new SourceNode(
                        step.dataTable.location.line,
                        column(step.dataTable.location),
                        fileName,
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
                ],
              ),
          ),
        )
        .add("})");
    }
  };

function column(location: Location) {
  return location.column !== undefined ? location.column - 1 : null;
}

function rawTable(dataTable: DataTable): string[][] {
  return dataTable.rows.map((row) => row.cells.map((cell) => cell.value));
}
