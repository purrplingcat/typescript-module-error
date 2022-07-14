import pino, { Logger } from "pino"
import { getIn } from "../utils";
import useConfig from "./config";
import pretty from "pino-pretty"

let logger: Logger;

export default function useLogger(name?: string): Logger {
  if (!logger) {
    const config = useConfig();
    const level = getIn(config, ["logger", "level"], "info")

    logger = pino({ level }, pino.multistream([
      { level, stream: pretty({ translateTime: true, })}
    ]));
  }

  if (name) {
    return logger.child({ name });
  }

  return logger;
}
