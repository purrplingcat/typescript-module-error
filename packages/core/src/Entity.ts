import EventEmitter from "events"
import useLogger from "./hooks/logger"
import bind from "./bind";
import { HydratedDocument } from "mongoose"
import { Senses } from "./Senses"
import { shallowEqual } from "fast-equals";

const logger = useLogger()

export type Uid = string | number | Symbol
export type Literal = string | number | boolean | bigint
export type Command = (params: any, entity: IController) => void | Promise<void>
export type EntityProps<T = any> = Record<string, Literal> & T
export type EntityKind = "device" | "room" | "resident"

export interface IController<T = any> {
  id: Uid
  entity: HydratedDocument<T>
  commands: Map<string, Command>
  mutate(newProps: Partial<T>): Promise<boolean>
}

export declare interface Controller {
  on(event: "updated", cb: (entity: this) => void): this
  on(event: "change", cb: (oldProps: Readonly<EntityProps>, newProps: Readonly<EntityProps>) => void): this

  emit(event: "updated", entity: this): boolean
  emit(event: "change", oldProps: Readonly<EntityProps>, newProps: Readonly<EntityProps>): boolean
}

export class Controller<T = {}> extends EventEmitter implements IController<T> {
  id: Uid
  lastUpdate: number
  commands: Map<string, Command> = new Map()
  senses: Senses
  entity: HydratedDocument<T>

  constructor(id: Uid, entity: HydratedDocument<T>, senses: Senses) {
    super()
    this.id = id
    this.entity = entity
    this.senses = senses
    this.lastUpdate = Date.now()
  }

  @bind
  update() {
    this.lastUpdate = Date.now()
    return this.emit("updated", this)
  }

  async mutate(newProps: Partial<T>, force = false): Promise<boolean> {
    const current: T = this.entity.toObject<T>()
    const toUpdate = <T>{ ...current, ...newProps }
    
    if (force || !shallowEqual(current, toUpdate)) {
      this.entity.set(toUpdate)
      await this.entity.save()
      this.emit("change", current, toUpdate)
      this.update()
      logger.trace({ oldProps: current, newProps: toUpdate }, `Props changed in '${this.id}'`)

      return true;
    }
    
    return false
  }
}
