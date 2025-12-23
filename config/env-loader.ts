// config/env-loader.ts
import { baseEnv } from "@config/environment/base.env";
import { devEnv } from "@config/environment/dev.env";
import { qaEnv } from "@config/environment/qa.env";
import { stageEnv } from "@config/environment/stage.env";

export type EnvironmentName = "dev" | "qa" | "stage" | "prod";

export function loadEnvironment() {
  const envName = (process.env.ENV ||
                   process.env.ENVIRONMENT ||
                   "dev") as EnvironmentName;

  switch (envName) {
    case "dev":
      return { ...baseEnv, ...devEnv, name: "dev" };
    case "qa":
      return { ...baseEnv, ...qaEnv, name: "qa" };
    case "stage":
      return { ...baseEnv, ...stageEnv, name: "stage" };
    default:
      return { ...baseEnv, ...devEnv, name: "dev" };
  }
}
