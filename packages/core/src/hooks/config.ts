import { IClientOptions } from "mqtt";
import yaml from "yaml";
import fs from "fs";

export interface IConfig {
  mqtt: IClientOptions
  modules: string[]
  tps: number
  [key: string]: any
}

let loaded = false
let config: IConfig = {
  mqtt: {},
  modules: [],
  tps: 20
}

export function loadConfig(fileName: string) {
  return yaml.parse(fs.readFileSync(fileName).toString());
}

export default function useConfig(configToMerge?: Partial<IConfig>) {
  if (!loaded) {
    const hasCustomConfig = !!process.env.SENSES_CONFIG
    const fileName = process.env.SENSES_CONFIG ?? "config/senses.yml"

    if (hasCustomConfig || fs.existsSync(fileName)) {
      config = { ...config, ...loadConfig(fileName) }
    }

    loaded = true;
  }

  if (configToMerge) {
    config = {
      ...config,
      ...configToMerge
    }
  }

  return config;
}
