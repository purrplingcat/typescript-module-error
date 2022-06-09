import EventEmitter from "events";
import * as mqtt from "mqtt";
import { encodeJson } from "./composables";
import useLogger from "./composables/logger";

export type Listener = (payload: Buffer | string) => void;
export interface IHandler {
  topic: string;
  opts?: mqtt.IClientSubscribeOptions;
  listener: Listener;
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

  async subscribe(topic: string, listener: Listener, opts?: mqtt.IClientSubscribeOptions): Promise<void> {
    const handler: IHandler = {
      topic, opts, listener,
    }

    await this._subscribe(handler);
    this.handlers.push(handler);
  }

  publish(topic: string, payload?: unknown): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const message = createMessage(payload)

      this.mqtt.publish(topic, message, (err) => {
        if (err) {
          logger.error(err, `Failed to publish message on topic ${topic}`)
          return reject(err)
        }

        logger.trace({ payload }, `Published message on topic ${topic}`)
        return resolve()
      })
    })
  }

  private onMessage = (topic: string, payload: Buffer) => {
    logger.trace({
      topic,
      message: payload.toString(),
      data: Array.from(payload)
    }, "Received message")
    this.handlers
      .filter((h) => h.topic == topic)
      .forEach((h) => h.listener(payload))
  }

  private _subscribe(handler: IHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      const { topic, opts } = handler
      const onSubscribe = (err: Error) => {
        if (err) {
          logger.error(err, `Error while subscribing topic ${topic}`)
          return reject(err)
        }
  
        logger.trace({ topic, opts }, "Topic subscribed")
        return resolve()
      }
  
      if (opts) {
        this.mqtt.subscribe(topic, opts, onSubscribe)
        return
      }
      
      this.mqtt.subscribe(topic, onSubscribe)
    })
  }
}
