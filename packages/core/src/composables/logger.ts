import pino, { Logger } from "pino"
import { getIn } from "../utils";
import useConfig from "./config";

let logger: Logger;

export default function useLogger(name?: string): Logger {
  if (!logger) {
    const config = useConfig();
    const level = getIn(config, ["logger", "level"], "info")

    logger = pino({
      level,
      transport: {
        target: "pino-pretty",
        options: {
          translateTime: true,
        }
      }
    });
  }

  if (name) {
    return logger.child({ name });
  }

  return logger;
}
