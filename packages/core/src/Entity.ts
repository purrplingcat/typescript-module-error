import EventEmitter from "events"
import useLogger from "./composables/logger"
import { Sync } from "./composables/sync"
import { Senses } from "./Senses"
import { StateProp } from "./State"

const logger = useLogger()

export type Uid = string | number | Symbol
export type Literal = string | number | boolean | bigint
export type Command = (params: any, entity: IEntity) => void | Promise<void>

export interface IEntity {
  id: Uid
  name: string
  type: "device" | "room"
  props: Record<string, Literal>
  dirty: boolean
  commands: Map<string, Command>
  template: string;
  markDirty(): void
  markClean(): void
}

export abstract class Entity extends EventEmitter implements IEntity {
  id: Uid
  name: string
  template: string
  props: Record<string, Literal> = {}
  commands: Map<string, Command> = new Map()
  dirty: boolean = false
  senses: Senses
  sync?: Sync

  abstract type: "device" | "room"

  constructor(id: Uid, name: string, senses: Senses) {
    super()
    this.template = ""
    this.name = name
    this.id = id
    this.senses = senses
  }

  markDirty(): void {
    this.dirty = true
    this.sync?.push(this)
  }

  markClean(): void {
    this.dirty = false;
    this.sync?.remove(this)
  }

  bindProp<TValue extends Literal>(key: string, prop: StateProp<TValue>) {
    this.props[key] = prop.value

    prop.on("change", (v) => {
      const old = this.props[key]
      this.props[key] = v
      this.markDirty();
      logger.trace({ key, old, new: this.props[key] }, `Prop value changed in '${this.id}'`)
    })
  }
}
