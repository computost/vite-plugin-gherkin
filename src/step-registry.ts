// There are several cases in this file where `any` is needed for our current
// implementation of the API. There might be some ways to improve type safety,
// but for now, we leave this comment and disable as a TODO.
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { TestContext } from "vitest";

import {
  CucumberExpression,
  type Expression,
  ParameterTypeRegistry,
  RegularExpression,
} from "@cucumber/cucumber-expressions";

type BaseContext = Record<string, any>;

export interface RegisterStep<ExtraContext extends BaseContext> {
  <TArgs extends any[]>(
    expression: string,
    step: (
      args: TArgs,
      context: ExtraContext & TestContext,
    ) => Promise<void> | void,
  ): void;
  (
    regExp: RegExp,
    step: (
      args: readonly string[],
      context: ExtraContext & TestContext,
    ) => Promise<void> | void,
  ): void;
}

export type StepFunction<ExtraContext extends BaseContext> = (
  args: any[],
  context: ExtraContext & TestContext,
) => Promise<void> | void;

const stepRegistry: {
  expression: Expression;
  step: StepFunction<object>;
}[] = [];
const parameterTypeRegistry = new ParameterTypeRegistry();

export const registerStep: RegisterStep<object> = (
  expression: RegExp | string,
  step: StepFunction<object>,
) => {
  if (typeof expression === "string") {
    stepRegistry.push({
      expression: new CucumberExpression(expression, parameterTypeRegistry),
      step,
    });
  } else {
    stepRegistry.push({
      expression: new RegularExpression(expression, parameterTypeRegistry),
      step,
    });
  }
};

export function getStep(step: string) {
  for (const { expression, step: fn } of stepRegistry) {
    const args = expression.match(step);
    if (args) {
      return { args, fn };
    }
  }
  return null;
}
