import EventEmitter from "events";
import { QoS } from "mqtt";
import { watchTopic } from "../hooks";

export type PresenceResolver = (payload: unknown) => boolean

export class Presence extends EventEmitter {
  private _map: Map<string, boolean> = new Map()

  get online(): boolean {
    const presences = Array.from(this._map.values())

    return presences.every((p) => p)
  }
  
  watch(topic: string, resolver: string | PresenceResolver, qos: QoS = 0) {
    watchTopic(topic, { qos }).subscribe((p) => {
      const presence = typeof resolver === "function" 
        ? resolver(p) 
        : p === resolver

      this._map.set(topic, presence)
      this.emit("presence", this.online)
    })
  }
}
