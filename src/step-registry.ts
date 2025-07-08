import type { TestContext } from "vitest";

import {
  CucumberExpression,
  type Expression,
  ParameterTypeRegistry,
  RegularExpression,
} from "@cucumber/cucumber-expressions";

import type { DataTable } from "./data-table.ts";

type CucumberArgs<Expression extends string> =
  Expression extends `${string}{${infer Arg}}${infer Post}`
    ? [
        Arg extends keyof ParameterTypeArgs ? ParameterTypeArgs[Arg] : unknown,
        ...CucumberArgs<Post>,
      ]
    : [];

export interface ParameterTypeArgs {
  "": string;
  float: number;
  int: number;
  string: string;
  word: string;
}

export interface RegisterStep<ExtraContext = unknown> {
  <Expression extends string>(
    expression: Expression,
    step: StepFunction<ExtraContext, CucumberArgs<Expression>>,
  ): void;
  (regExp: RegExp, step: StepFunction<ExtraContext, string[]>): void;
}

type StepArgs<Args extends unknown[]> =
  | [...Args, DataTable]
  | [...Args, string]
  | Args;

export type StepFunction<
  ExtraContext = unknown,
  Args extends unknown[] = unknown[],
> = (
  args: StepArgs<Args>,
  context: ExtraContext & TestContext,
) => Promise<void> | void;

const stepRegistry: {
  expression: Expression;
  step: StepFunction;
}[] = [];
const parameterTypeRegistry = new ParameterTypeRegistry();

export const registerStep: RegisterStep<object> = <Args extends unknown[]>(
  expression: RegExp | string,
  step: StepFunction<unknown, Args>,
) => {
  if (typeof expression === "string") {
    stepRegistry.push({
      expression: new CucumberExpression(expression, parameterTypeRegistry),
      step: step as StepFunction,
    });
  } else {
    stepRegistry.push({
      expression: new RegularExpression(expression, parameterTypeRegistry),
      step: step as StepFunction,
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
