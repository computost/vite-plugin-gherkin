import { registerStep } from "./step-registry.js";
export type { RegisterStep, StepFunction } from "./step-registry.js";
export { vitePluginGherkin } from "./vite-plugin-gherkin.js";

export const Given = registerStep;
export const When = registerStep;
export const Then = registerStep;
