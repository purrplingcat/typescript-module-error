import * as mqtt from "mqtt";

export type Listener = (payload: Buffer | string) => void;
export interface IHandler {
  topic: string;
  opts?: mqtt.IClientSubscribeOptions;
  listener: Listener;
}

export class MqttClient {
  mqtt: mqtt.MqttClient;
  private handlers: IHandler[];

  constructor(opts: mqtt.IClientOptions) {
    this.handlers = []
    this.mqtt = mqtt.connect(opts)

    this.mqtt.on("connect", this.onConnect)
    this.mqtt.on("message", this.onMessage)
  }

  subscribe(topic: string, listener: Listener, opts?: mqtt.IClientSubscribeOptions): this {
    const handler: IHandler = {
      topic, opts, listener,
    }

    this.handlers.push(handler);

    if (this.mqtt.connected) {
      this._subscribe(handler);
    }

    return this;
  }

  publish(topic: string, payload: string | Buffer) {
    return new Promise<void>((resolve, reject) => {
      this.mqtt.publish(topic, payload, (e) => e ? reject(e) : resolve())
    })
  }

  private onMessage = (topic: string, payload: Buffer) => {
    this.handlers
      .filter((h) => h.topic == topic)
      .forEach((h) => h.listener(payload))
  }

  private onConnect = () => {
    for (const handler of this.handlers) {
      this._subscribe(handler)
    }
  }

  private _subscribe(handler: IHandler): void {
    if (handler.opts) {
      this.mqtt.subscribe(handler.topic, handler.opts, console.log)
      return
    }

    this.mqtt.subscribe(handler.topic, console.log)
  }
}
