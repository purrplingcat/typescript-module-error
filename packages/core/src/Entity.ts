import EventEmitter from "events"
import useLogger from "./composables/logger"
import { Sync } from "./composables/sync"
import { Senses } from "./Senses"
import { observable, observe } from "./utils"

const logger = useLogger()

export type Uid = string | number | Symbol
export type Literal = string | number | boolean | bigint
export type Command = (params: any, entity: IEntity) => void | Promise<void>
export type EntityProps = Record<string, Literal>

export interface IEntity {
  id: Uid
  name: string
  kind: "device" | "room"
  props: EntityProps
  dirty: boolean
  commands: Map<string, Command>
  template: string
  markDirty(): void
  markClean(): void
}

export abstract class Entity extends EventEmitter implements IEntity {
  id: Uid
  name: string
  template: string
  lastUpdate: number
  commands: Map<string, Command> = new Map()
  dirty: boolean = false
  senses: Senses
  sync?: Sync

  abstract kind: "device" | "room"
  private _props: EntityProps

  constructor(id: Uid, name: string, senses: Senses, props?: EntityProps) {
    super()
    this.template = ""
    this.name = name
    this.id = id
    this.senses = senses
    this.lastUpdate = Date.now()
    this._props = observable(props)

    observe(this._props, this._onPropValueChange)
  }

  get props() {
    return this._props
  }

  private _onPropValueChange = (key: string, newValue: Literal, oldValue: Literal) => {
    this.markDirty()
    logger.trace({ key, oldValue, newValue }, `Prop value changed in '${this.id}'`)
  }

  markDirty(): void {
    if (this.dirty) { return }
    this.lastUpdate = Date.now()
    this.dirty = true
    this.sync?.push(this)
  }

  markClean(): void {
    this.dirty = false
    this.sync?.remove(this)
  }
}
