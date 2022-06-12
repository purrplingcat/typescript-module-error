import EventEmitter from "events"
import useLogger from "./composables/logger"
import { Senses } from "./Senses"
import { shallowEqual } from "fast-equals";

const logger = useLogger()

export type Uid = string | number | Symbol
export type Literal = string | number | boolean | bigint
export type Command = (params: any, entity: IEntity) => void | Promise<void>
export type EntityProps<T = any> = Record<string, Literal> & T
export type EntityKind = "device" | "room" | "resident"

export interface IEntity {
  id: Uid
  name: string
  kind: EntityKind
  props: Readonly<EntityProps>
  commands: Map<string, Command>
  template: string
  mutate(newProps: Partial<EntityProps>): boolean
}

export declare interface Entity {
  on(event: "updated", cb: (entity: this) => void): this
  on(event: "change", cb: (oldProps: Readonly<EntityProps>, newProps: Readonly<EntityProps>) => void): this

  emit(event: "updated", entity: this): boolean
  emit(event: "change", oldProps: Readonly<EntityProps>, newProps: Readonly<EntityProps>): boolean
}

export abstract class Entity extends EventEmitter implements IEntity {
  id: Uid
  name: string
  template: string
  lastUpdate: number
  commands: Map<string, Command> = new Map()
  senses: Senses

  abstract kind: EntityKind
  private _props: Readonly<EntityProps>

  constructor(id: Uid, name: string, senses: Senses, props?: EntityProps) {
    super()
    this.template = ""
    this.name = name
    this.id = id
    this.senses = senses
    this.lastUpdate = Date.now()
    this._props = props ?? {}
  }

  get props() {
    return this._props
  }

  update() {
    this.lastUpdate = Date.now()
    return this.emit("updated", this)
  }

  mutate(newProps: Partial<EntityProps>): boolean {
    const toUpdate = <EntityProps>{ ...this._props, ...newProps }

    if (!shallowEqual(this.props, toUpdate)) {
      const oldProps = this._props

      this._props = Object.freeze(toUpdate)
      this.emit("change", oldProps, this._props)
      this.update()
      logger.trace({ oldProps, newProps: this._props }, `Props changed in '${this.id}'`)

      return true;
    }
    
    return false
  }
}
