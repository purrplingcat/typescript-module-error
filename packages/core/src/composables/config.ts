import { IClientOptions } from "mqtt";
import yaml from "yaml";
import fs from "fs";

export interface IConfig {
  mqtt: IClientOptions
  apps: string[]
  tps: number
}

let config: IConfig = {
  mqtt: {},
  apps: [],
  tps: 20
}

export function loadConfig(fileName: string) {
  return yaml.parse(fs.readFileSync(fileName).toString());
}

export default function useConfig(configToMerge?: Partial<IConfig>) {
  if (configToMerge) {
    config = {
      ...config,
      ...configToMerge
    }
  }

  return config;
}
