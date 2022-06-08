import { MqttClient } from "../MqttClient";
import useConfig from "./config";
import useLogger from "./logger";

let mqttClient: MqttClient;

export default function useMqtt() {
  if (!mqttClient) {
    const config = useConfig();
    const logger = useLogger();

    mqttClient = new MqttClient(config.mqtt);
    mqttClient.mqtt.on("connect", logger.info)
    mqttClient.mqtt.on("error", logger.error)
  }

  return mqttClient;
}
