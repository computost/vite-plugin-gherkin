import { registerStep } from "./step-registry.ts";
export type { DataTable } from "./data-table.ts";
export type { ParameterTypeArgs, RegisterStep } from "./step-registry.ts";
export { vitePluginGherkin } from "./vite-plugin-gherkin.ts";

export const Given = registerStep;
export const When = registerStep;
export const Then = registerStep;
