import { Entity, IEntity, Literal, Uid } from "../Entity";
import { Senses } from "../Senses";
import { StateProp } from "../State";

export interface RoomOptions {
  id?: Uid
  name: string
  description?: string
  props?: Record<string, StateProp<Literal>>
  devices?: any[]
  template?: string
}

export class Room extends Entity {
  type: "room"
  devices: IEntity[]

  constructor(id: Uid, name: string, senses: Senses) {
    super(id, name, senses)
    this.type = "room"
    this.devices = []
  }
}
