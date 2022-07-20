import EventEmitter from "events";
import * as mqtt from "mqtt";
import { IClientPublishOptions } from "mqtt";
import { encodeJson } from "./hooks";
import useLogger from "./hooks/logger";
import { bind } from "./utils";

export type Listener = (payload: Buffer | string, context: MessageContext) => void;
export interface IHandler {
  topic: string;
  listener: Listener;
  qos: mqtt.QoS
}

export interface MessageContext {
  topic: string
  qos: mqtt.QoS
  properties?: {
    payloadFormatIndicator?: boolean,
    messageExpiryInterval?: number,
    topicAlias?: number,
    responseTopic?: string,
    correlationData?: Buffer,
    userProperties?: mqtt.UserProperties,
    subscriptionIdentifier?: number,
    contentType?: string
  }
}

const logger = useLogger("mqtt")

function createMessage(payload: unknown): string | Buffer {
  if (typeof payload === "undefined") {
    return ""
  }

  if (typeof payload === "string" || Buffer.isBuffer(payload)) {
    return payload
  }

  return encodeJson(payload)
}

export class MqttClient extends EventEmitter {
  mqtt: mqtt.MqttClient;
  private handlers: IHandler[]

  constructor(opts: mqtt.IClientOptions) {
    super()
    this.handlers = []
    this.mqtt = mqtt.connect(opts)

    this.mqtt.on("connect", () => this.emit("connect", this))
    this.mqtt.on("message", this.onMessage)
  }

  subscribe(topic: string, listener: Listener, opts?: mqtt.IClientSubscribeOptions): Promise<void> {
    const handler: IHandler = {
      topic, listener, qos: opts?.qos ?? 0
    }

    this.handlers.push(handler);
    return this._subscribe(handler, opts);
  }

  publish(topic: string, payload?: unknown, opts: IClientPublishOptions = {}): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const message = createMessage(payload)

      this.mqtt.publish(topic, message, opts, (err) => {
        if (err) {
          logger.error(err, `Failed to publish message on topic ${topic}`)
          return reject(err)
        }

        logger.trace({ payload }, `Published message on topic ${topic}`)
        return resolve()
      })
    })
  }

  @bind
  private onMessage(topic: string, payload: Buffer, packet: mqtt.IPublishPacket) {
    logger.trace({
      topic,
      message: String(payload)
    }, "Received message")
    this.handlers
      .filter((h) => h.topic == topic && h.qos >= packet.qos)
      .forEach((h) => h.listener(payload, {
        topic,
        qos: packet.qos,
        properties: packet.properties
      }))
  }

  private _subscribe(handler: IHandler, opts?: mqtt.IClientSubscribeOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const { topic } = handler
      const onSubscribe = (err: Error) => {
        if (err) {
          logger.error(err, `Error while subscribing topic ${topic}`)
          return reject(err)
        }

        logger.trace({ topic, opts }, "Topic subscribed")
        return resolve()
      }

      // Force QoS to 0 for physical subscription, 
      // because we handle QoS in virtual subscribers (IHandler) individually
      this.mqtt.subscribe(topic, { ...opts, qos: opts?.qos ?? 0 }, onSubscribe)
    })
  }
}
