import { IClientPublishOptions } from "mqtt";
import { Listener, MqttClient } from "../MqttClient";
import useConfig from "./config";
import { useContext } from "./context";
import useLogger from "./logger";

export const onMqttConnect = (cb: (mqtt: MqttClient) => void) => useMqtt().on("connect", cb)

export function usePublisher(topic: string, payload?: unknown, opts?: IClientPublishOptions): (v?: unknown) => Promise<void> {
  return (p) => useMqtt()
    .publish(topic, typeof p === "undefined" ? payload : p, opts)
}

export function useMessage(topic: string, payload?: unknown): () => Promise<void> {
  return () => usePublisher(topic, payload)()
}

export function useSubscriber(topic: string): (cb: Listener) => Promise<void> {
  return (cb) => useMqtt().subscribe(topic, cb)
}

export function useSubscription(topic: string, cb: Listener): () => Promise<void> {
  return () => useSubscriber(topic)(cb)
}

function createMqttClient() {
  const config = useConfig();
  const logger = useLogger("mqtt");
  const mqttClient = new MqttClient(config.mqtt);

  const { protocol, hostname, port } = mqttClient.mqtt.options
  mqttClient.mqtt.on("connect", () => logger.info(`Mqtt connection established (${protocol}:${hostname}:${port})`))
  mqttClient.mqtt.on("error", (e) => logger.error(e, "Mqtt error"))

  return mqttClient
}

export default function useMqtt() {
  return useContext().resolve("mqtt", createMqttClient)
}
