import { Entity, EntityProps, IEntity, Literal, Uid } from "../Entity";
import { Senses } from "../Senses";

export interface RoomOptions {
  id?: Uid
  name: string
  description?: string
  template?: string
  props?: EntityProps
}

export class Room extends Entity {
  kind: "room"

  constructor(id: Uid, name: string, senses: Senses, props?: EntityProps) {
    super(id, name, senses, props)
    this.kind = "room"
  }
}
