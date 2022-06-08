const { useSenses, useConfig, useLogger, version } = require("@senses/core");
const config = useConfig();
const logger = useLogger();

function loadApp(app) {
  require(app);
  logger.debug(`Loaded application ${app}`);
}

logger.info(`Senses version ${version}`)
config.apps.forEach(loadApp);

useSenses().start();
