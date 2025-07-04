import {
  CucumberExpression,
  type Expression,
  ParameterTypeRegistry,
  RegularExpression,
} from "@cucumber/cucumber-expressions";
import type { TestContext } from "vitest";

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

export type StepFunction<ExtraContext extends BaseContext> = (
  args: any[],
  context: TestContext & ExtraContext
) => void | Promise<void>;

const stepRegistry: {
  expression: Expression;
  step: StepFunction<object>;
}[] = [];
const parameterTypeRegistry = new ParameterTypeRegistry();

export const registerStep: RegisterStep<object> = (
  expression: string | RegExp,
  step: StepFunction<object>
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
  for (let { expression, step: fn } of stepRegistry) {
    const args = expression.match(step);
    if (args) {
      return { fn, args };
    }
  }
  return null;
}
