import { Entity, EntityProps, IEntity, Literal, Uid } from "../Entity";
import { Senses } from "../Senses";
import { PipeIO } from "../State";

export interface RoomOptions {
  id?: Uid
  name: string
  description?: string
  devices?: any[]
  template?: string
  props?: EntityProps
}

export class Room extends Entity {
  kind: "room"
  devices: IEntity[]

  constructor(id: Uid, name: string, senses: Senses, props?: EntityProps) {
    super(id, name, senses, props)
    this.kind = "room"
    this.devices = []
  }
}
