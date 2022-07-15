import EventEmitter from "events";

export type ValueMapper<TValue = any> = (v: unknown) => TValue
export type ValueCondition<TValue> = (v: TValue) => boolean

export class Reactive<TValue> {
  private _mapper: ValueMapper<TValue>
  private _filter?: ValueCondition<TValue>
  private _bus = new EventEmitter

  constructor(mapper: ValueMapper<TValue>, condition?: ValueCondition<TValue>) {
    this._mapper = mapper
    this._filter = condition
  }

  next = (dirty: unknown): boolean => {
    const value = this._mapper(dirty)

    if (typeof this._filter === "function" && !this._filter(value)) {
      return false
    }

    return this._bus.emit("next", value)
  }

  subscribe = (subscriber: (value: TValue) => void): this => {
    this._bus.on("next", subscriber)
    return this
  }
}
