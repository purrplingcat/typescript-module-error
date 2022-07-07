import { Entity, EntityProps, Uid } from "../Entity";
import { Heartbeat } from "../Heartbeat";
import { Senses } from "../Senses";
import { Room } from "./Room";

export interface DeviceOptions {
  id: Uid
  name: string
  description?: string
  template?: string
  props?: EntityProps
  room?: Room,
  type: string,
}

export class Device extends Entity {
  kind: "device";
  room?: Room
  presence?: Heartbeat
  type?: string

  constructor(id: Uid, name: string, senses: Senses, props?: EntityProps) {
    super(id, name, senses, props)
    this.kind = "device"
  }

  get available(): boolean {
    if (this.presence == null) {
      return true
    }

    return !this.presence.dead
  }
}
