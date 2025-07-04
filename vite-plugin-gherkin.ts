import { test, type TestContext } from "vitest";
import type { Vite } from "vitest/node";
import path from "path";
import { SourceNode } from "source-map-generator";
import {
  AstBuilder,
  GherkinClassicTokenMatcher,
  Parser,
} from "@cucumber/gherkin";
import { IdGenerator, Location } from "@cucumber/messages";
import {
  Argument,
  CucumberExpression,
  Expression,
  ParameterTypeRegistry,
  RegularExpression,
} from "@cucumber/cucumber-expressions";
import { stripLiteral } from "strip-literal";

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
            .add(`import { buildTestFunction } from "vite-plugin-gherkin";\n`)
            .add(
              new SourceNode(
                gherkinDocument.feature.location.line,
                column(gherkinDocument.feature.location),
                id,
                [
                  "describe(",
                  JSON.stringify(gherkinDocument.feature.name),
                  ", async () => {\n",
                  ...gherkinDocument.feature.children.map((child) => {
                    if (child.scenario) {
                      return new SourceNode(
                        child.scenario.location.line,
                        column(child.scenario.location),
                        id,
                        [
                          "test(",
                          JSON.stringify(child.scenario.name),
                          ", await buildTestFunction(async (step) => {\n",
                          ...child.scenario.steps.map(
                            (step) =>
                              new SourceNode(
                                step.location.line,
                                column(step.location),
                                id,
                                [
                                  "await step(",
                                  JSON.stringify(step.text),
                                  ",",
                                  step.docString
                                    ? JSON.stringify(step.docString.content)
                                    : "undefined",
                                  ");\n",
                                ]
                              )
                          ),
                          "}));\n",
                        ]
                      );
                    }
                    throw new Error("Not Implemented");
                  }),
                  "});",
                ]
              )
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

type BaseContext = Record<string, any>;

export interface RegisterStep<ExtraContext extends BaseContext> {
  <TArgs extends any[]>(
    expression: string,
    step: (
      args: TArgs,
      context: TestContext & ExtraContext
    ) => void | Promise<void>
  ): void;
  (
    regExp: RegExp,
    step: (
      args: readonly string[],
      context: TestContext & ExtraContext
    ) => void | Promise<void>
  ): void;
}

type StepFunction<ExtraContext extends BaseContext> = (
  args: any[],
  context: TestContext & ExtraContext
) => void | Promise<void>;

const stepRegistry: {
  expression: Expression;
  step: StepFunction<object>;
}[] = [];
const parameterTypeRegistry = new ParameterTypeRegistry();

const registerStep: RegisterStep<object> = (
  expression: string | RegExp,
  step: StepFunction<object>
) => {
  if (typeof expression === "string") {
    stepRegistry.push({
      expression: new CucumberExpression(expression, parameterTypeRegistry),
      step,
    });
  }
  else {
    stepRegistry.push({
      expression: new RegularExpression(expression, parameterTypeRegistry),
      step,
    });
  }
};

export const Given = registerStep;
export const When = registerStep;
export const Then = registerStep;

export async function buildTestFunction(
  executeTest: (
    step: (step: string, doc?: string) => void | Promise<void>
  ) => Promise<void>
) {
  const stepMatches: Record<
    string,
    { fn: StepFunction<object>; args: readonly Argument[] }
  > = {};
  const contextDependencies = new Set<string>();
  const missingSteps: string[] = [];

  await executeTest(function buildStepPlan(step) {
    const stepDefintion = getStep(step);
    if (stepDefintion) {
      stepMatches[step] = stepDefintion;
      getUsedProps(stepDefintion.fn, 1).forEach((contextDependency) =>
        contextDependencies.add(contextDependency)
      );
    } else {
      missingSteps.push(step);
    }
  });

  if (missingSteps.length) {
    return function reportMissingSteps() {
      return executeTest((step) => {
        if (missingSteps.includes(step)) {
          throw new Error(`Undefined step: ${step}`);
        }
      });
    };
  }

  function scenarioFunction(context: TestContext & unknown) {
    return executeTest((step, doc) => {
      const { args, fn } = stepMatches[step];
      return fn([...args.map((arg) => arg.getValue(context)), doc], context);
    });
  }
  scenarioFunction.toString = () =>
    `({${[...contextDependencies].join(",")}}) => {}`;
  return scenarioFunction;
}

function getStep(step: string) {
  for (let { expression, step: fn } of stepRegistry) {
    const args = expression.match(step);
    if (args) {
      return { fn, args };
    }
  }
  return null;
}

function getUsedProps(fn: Function, fixtureIndex: number) {
  let fnString = stripLiteral(fn.toString());
  // match lowered async function and strip it off
  // example code on esbuild-try https://esbuild.github.io/try/#YgAwLjI0LjAALS1zdXBwb3J0ZWQ6YXN5bmMtYXdhaXQ9ZmFsc2UAZQBlbnRyeS50cwBjb25zdCBvID0gewogIGYxOiBhc3luYyAoKSA9PiB7fSwKICBmMjogYXN5bmMgKGEpID0+IHt9LAogIGYzOiBhc3luYyAoYSwgYikgPT4ge30sCiAgZjQ6IGFzeW5jIGZ1bmN0aW9uKGEpIHt9LAogIGY1OiBhc3luYyBmdW5jdGlvbiBmZihhKSB7fSwKICBhc3luYyBmNihhKSB7fSwKCiAgZzE6IGFzeW5jICgpID0+IHt9LAogIGcyOiBhc3luYyAoeyBhIH0pID0+IHt9LAogIGczOiBhc3luYyAoeyBhIH0sIGIpID0+IHt9LAogIGc0OiBhc3luYyBmdW5jdGlvbiAoeyBhIH0pIHt9LAogIGc1OiBhc3luYyBmdW5jdGlvbiBnZyh7IGEgfSkge30sCiAgYXN5bmMgZzYoeyBhIH0pIHt9LAoKICBoMTogYXN5bmMgKCkgPT4ge30sCiAgLy8gY29tbWVudCBiZXR3ZWVuCiAgaDI6IGFzeW5jIChhKSA9PiB7fSwKfQ
  //   __async(this, null, function*
  //   __async(this, arguments, function*
  //   __async(this, [_0, _1], function*
  if (
    /__async\((?:this|null), (?:null|arguments|\[[_0-9, ]*\]), function\*/.test(
      fnString
    )
  ) {
    fnString = fnString.split(/__async\((?:this|null),/)[1];
  }
  const match = fnString.match(/[^(]*\(([^)]*)/);
  if (!match) {
    return [];
  }

  const args = splitByComma(match[1]);
  if (args.length <= fixtureIndex) {
    return [];
  }

  let fixtureArg = args[fixtureIndex];

  if (!(fixtureArg.startsWith("{") && fixtureArg.endsWith("}"))) {
    throw new Error(
      `The first argument inside a fixture must use object destructuring pattern, e.g. ({ test } => {}). Instead, received "${fixtureArg}".`
    );
  }

  const _first = fixtureArg.slice(1, -1).replace(/\s/g, "");
  const props = splitByComma(_first).map((prop) => {
    return prop.replace(/:.*|=.*/g, "");
  });

  const last = props.at(-1);
  if (last && last.startsWith("...")) {
    throw new Error(
      `Rest parameters are not supported in fixtures, received "${last}".`
    );
  }

  return props;
}

function splitByComma(s: string) {
  const result = [];
  const stack = [];
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "{" || s[i] === "[") {
      stack.push(s[i] === "{" ? "}" : "]");
    } else if (s[i] === stack[stack.length - 1]) {
      stack.pop();
    } else if (!stack.length && s[i] === ",") {
      const token = s.substring(start, i).trim();
      if (token) {
        result.push(token);
      }
      start = i + 1;
    }
  }
  const lastToken = s.substring(start).trim();
  if (lastToken) {
    result.push(lastToken);
  }
  return result;
}
