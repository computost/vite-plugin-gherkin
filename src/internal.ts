import type { TestContext } from "vitest";

import { stripLiteral } from "strip-literal";

import { getStep, type StepFunction } from "./step-registry.ts";

export function buildTestFunction(
  testSteps: <T>(step: (text: string, doc?: string) => T) => Generator<T>,
) {
  const steps = Array.from(testSteps(getStep));

  if (!allDefined(steps)) {
    return function reportMissingSteps() {
      let i = 0;
      testSteps((text) => {
        if (!steps[i]) {
          throw new Error(`Undefined step: ${text}`);
        }
      }).forEach(() => i++);
    };
  }

  const scenarioFunction = async function scenarioFunction(
    context: TestContext & unknown,
  ) {
    let i = 0;
    for (const task of testSteps((_, doc) => {
      const step = steps[i];
      return step.fn(
        [...step.args.map((arg) => arg.getValue(context)), doc],
        context,
      );
    })) {
      await task;
      i++;
    }
  };
  scenarioFunction.toString = () =>
    `({${[...new Set(steps.flatMap((step) => getUsedProps(step.fn)))].join(
      ",",
    )}}) => {}`;
  return scenarioFunction;
}

function allDefined<T>(arr: T[]): arr is NonNullable<T>[] {
  return arr.every((e) => e != null);
}

// borrowed directly from the vitest repo with minor modifications
// https://github.com/vitest-dev/vitest/blob/v3.2.4/packages/runner/src/fixture.ts#L341
function getUsedProps(fn: StepFunction<object>) {
  let fnString = stripLiteral(fn.toString());
  // match lowered async function and strip it off
  // example code on esbuild-try https://esbuild.github.io/try/#YgAwLjI0LjAALS1zdXBwb3J0ZWQ6YXN5bmMtYXdhaXQ9ZmFsc2UAZQBlbnRyeS50cwBjb25zdCBvID0gewogIGYxOiBhc3luYyAoKSA9PiB7fSwKICBmMjogYXN5bmMgKGEpID0+IHt9LAogIGYzOiBhc3luYyAoYSwgYikgPT4ge30sCiAgZjQ6IGFzeW5jIGZ1bmN0aW9uKGEpIHt9LAogIGY1OiBhc3luYyBmdW5jdGlvbiBmZihhKSB7fSwKICBhc3luYyBmNihhKSB7fSwKCiAgZzE6IGFzeW5jICgpID0+IHt9LAogIGcyOiBhc3luYyAoeyBhIH0pID0+IHt9LAogIGczOiBhc3luYyAoeyBhIH0sIGIpID0+IHt9LAogIGc0OiBhc3luYyBmdW5jdGlvbiAoeyBhIH0pIHt9LAogIGc1OiBhc3luYyBmdW5jdGlvbiBnZyh7IGEgfSkge30sCiAgYXN5bmMgZzYoeyBhIH0pIHt9LAoKICBoMTogYXN5bmMgKCkgPT4ge30sCiAgLy8gY29tbWVudCBiZXR3ZWVuCiAgaDI6IGFzeW5jIChhKSA9PiB7fSwKfQ
  //   __async(this, null, function*
  //   __async(this, arguments, function*
  //   __async(this, [_0, _1], function*
  if (
    /__async\((?:this|null), (?:null|arguments|\[[_0-9, ]*\]), function\*/.test(
      fnString,
    )
  ) {
    fnString = fnString.split(/__async\((?:this|null),/)[1];
  }
  const match = fnString.match(/[^(]*\(([^)]*)/);
  if (!match) {
    return [];
  }

  const args = splitByComma(match[1]);
  if (args.length <= 1) {
    return [];
  }

  const fixtureArg = args[1];

  if (!(fixtureArg.startsWith("{") && fixtureArg.endsWith("}"))) {
    throw new Error(
      `The first argument inside a fixture must use object destructuring pattern, e.g. ({ test } => {}). Instead, received "${fixtureArg}".`,
    );
  }

  const _first = fixtureArg.slice(1, -1).replace(/\s/g, "");
  const props = splitByComma(_first).map((prop) => {
    return prop.replace(/:.*|=.*/g, "");
  });

  const last = props.at(-1);
  if (last && last.startsWith("...")) {
    throw new Error(
      `Rest parameters are not supported in fixtures, received "${last}".`,
    );
  }

  return props;
}

function splitByComma(s: string) {
  const result: string[] = [];
  const stack: string[] = [];
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
