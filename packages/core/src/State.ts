import EventEmitter from "events";

export declare interface StateProp<TValue> {
  on(eventName: "change", cb: (value: TValue) => void): this
}

export class StateProp<TValue> extends EventEmitter {
  private _value: TValue

  constructor(initial: TValue) {
    super();
    this._value = initial
  }

  get value() {
    return this._value;
  }

  set value(newValue: TValue) {
    if (newValue === this._value) {
      return;
    }

    this._value = newValue
    this._emitChange()
  }

  private _emitChange = () => {
    this.emit("change", this._value)
  }
}
