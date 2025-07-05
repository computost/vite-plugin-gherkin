import { registerStep } from "./step-registry.ts";
export type { RegisterStep, StepFunction } from "./step-registry.ts";
export { vitePluginGherkin } from "./vite-plugin-gherkin.ts";

export const Given = registerStep;
export const When = registerStep;
export const Then = registerStep;
