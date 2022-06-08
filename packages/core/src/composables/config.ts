import { IClientOptions } from "mqtt";
import yaml from "yaml";
import fs from "fs";

export interface IConfig {
  mqtt: IClientOptions
  apps: string[]
  tps: number
}

let config: IConfig;
const configFile = process.env.SENSES_CONFIG = `config/senses.yml`;
const defaultConfig: IConfig = {
  mqtt: { },
  apps: [],
  tps: 20
}

export default function useConfig(): IConfig {
  if (!config) {
    config = {
      ...defaultConfig,
      ...yaml.parse(fs.readFileSync(configFile).toString())
    }
  }

  return config;
}
