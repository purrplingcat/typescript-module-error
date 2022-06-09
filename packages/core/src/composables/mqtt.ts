import { MqttClient } from "../MqttClient";
import useConfig from "./config";
import useLogger from "./logger";

let mqttClient: MqttClient;

export const onMqttConnect = (cb: (mqtt: MqttClient) => void) => useMqtt().on("connect", cb)

export default function useMqtt() {
  if (!mqttClient) {
    const config = useConfig();
    const logger = useLogger("mqtt");
  
    mqttClient = new MqttClient(config.mqtt);

    const { protocol, hostname, port } = mqttClient.mqtt.options
    mqttClient.mqtt.on("connect", () => logger.info(`Mqtt connection established (${protocol}:${hostname}:${port})`))
    mqttClient.mqtt.on("error", (e) => logger.error(e, "Mqtt error"))
  }

  return mqttClient;
}
