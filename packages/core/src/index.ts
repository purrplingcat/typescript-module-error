
export const version = require("../package.json").version

export { default as useConfig } from "./composables/config"
export { default as useSenses } from "./composables/senses"
export { default as useLogger } from "./composables/logger"
export * from "./composables/senses"
export * from "./composables/entities"
export * as utils from "./utils"
export * as suite from "./suite"
