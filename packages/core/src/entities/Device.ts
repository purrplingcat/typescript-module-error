import { Entity, EntityProps, Uid } from "../Entity";
import { Senses } from "../Senses";
import { Room } from "./Room";

export interface DeviceOptions {
  id: Uid
  name: string
  description?: string
  template?: string
  props?: EntityProps
  room?: Room
}

export class Device extends Entity {
  kind: "device" | "room";
  room?: Room

  constructor(id: Uid, name: string, senses: Senses, props?: EntityProps) {
    super(id, name, senses, props)
    this.kind = "device"
  }
}
