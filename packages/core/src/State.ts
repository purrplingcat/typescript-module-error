import EventEmitter from "events";

export type ValueMapper<TValue = any> = (v: unknown) => TValue;

export class PipeIO<TValue> {
  private _mapper: ValueMapper<TValue>
  private _bus = new EventEmitter

  constructor(mapper: ValueMapper<TValue>) {
    this._mapper = mapper
  }

  input = (dirty: unknown): this => {
    this._bus.emit("process", this._mapper(dirty))
    return this
  }

  output = (processor: (value: TValue) => void): this => {
    this._bus.on("process", processor)
    return this
  }
}
