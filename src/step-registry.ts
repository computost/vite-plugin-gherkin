import type { TestContext } from "vitest";

import {
  CucumberExpression,
  type Expression,
  ParameterTypeRegistry,
  RegularExpression,
} from "@cucumber/cucumber-expressions";

import type { DataTable } from "./data-table.ts";

export interface RegisterStep<ExtraContext = unknown> {
  <TArgs extends unknown[]>(
    expression: string,
    step: (
      args: [...TArgs, DataTable] | [...TArgs, string] | TArgs,
      context: ExtraContext & TestContext,
    ) => Promise<void> | void,
  ): void;
  <TArgs extends string[]>(
    regExp: RegExp,
    step: (
      args: [...TArgs, DataTable] | [...TArgs, string] | TArgs,
      context: ExtraContext & TestContext,
    ) => Promise<void> | void,
  ): void;
}

export type StepFunction<
  ExtraContext = unknown,
  TArgs extends unknown[] = unknown[],
> = (args: TArgs, context: ExtraContext & TestContext) => Promise<void> | void;

const stepRegistry: {
  expression: Expression;
  step: StepFunction;
}[] = [];
const parameterTypeRegistry = new ParameterTypeRegistry();

export const registerStep: RegisterStep = (
  expression: RegExp | string,
  step: StepFunction | StepFunction<unknown, string[]>,
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
