import pino, { Logger } from "pino"
import { getIn } from "../utils/misc";
import useConfig from "./config";
import pretty from "pino-pretty"
import { useContext } from "./context";

function createLogger() {
  const config = useConfig();
  const level = getIn(config, ["logger", "level"], "info")

  return pino({ level }, pino.multistream([
    { level, stream: pretty({ translateTime: true, })}
  ]));
}

export default function useLogger(name?: string): Logger {
  const logger = useContext().resolve<Logger>("logger", createLogger)
  if (name) {
    return logger.child({ name });
  }

  return logger;
}
