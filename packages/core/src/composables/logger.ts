import pino, { Logger } from "pino"
import useConfig from "./config";

let logger: Logger;

export default function useLogger(name?: string): Logger {
  if (!logger) {
    const config = useConfig();
    
    logger = pino({
      level: "trace",
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
