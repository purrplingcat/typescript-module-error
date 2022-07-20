import EventEmitter from "events"
import { shallowEqual } from "fast-equals"
import { bind } from "../utils"
import { useLogger } from "../hooks"
import { Senses } from "../Senses"
import { isDefined } from "../utils/misc"

export type Rid = string | symbol

const logger = useLogger()

export class State<T> extends EventEmitter {
  private _data: Readonly<T>
  private _draft: T | null = null
  private _updatedAt: Date = new Date()
  rid: Rid
  autoCommit = true

  constructor(rid: Rid, initialData: any) {
    super()
    this.rid = rid
    this._data = initialData
  }

  get data() {
    return this._data
  }

  get dirty() {
    return isDefined(this._draft)
  }

  get updatedAt() {
    return this._updatedAt
  }

  commit() {
    if (!isDefined(this._draft)) {
      return false
    }

    const snapshot = this._data
    const draft = this._draft

    this._draft = null

    if (shallowEqual(snapshot, draft)) {
      return false
    }

    this._data = Object.freeze(draft)
    this._updatedAt = new Date()
    this.emit("change", {
      rid: this.rid,
      updatedAt: this.updatedAt,
      from: snapshot,
      to: this._data
    })

    return true
  }

  draft(patch: Partial<T>) {
    const current = this._draft ?? { ...this._data }
    this._draft = {
      ...current,
      ...patch
    }
  }

  getDraftedData(): Readonly<T> | null {
    if (isDefined(this._draft)) {
      return Object.freeze({ ...this._draft })
    }

    return null
  }
}

export class StateManager {
  private _state = new Map<Rid, State<unknown>>()
  private _senses: Senses

  constructor(senses: Senses) {
    this._senses = senses

    senses.on("update", this._onUpdate)
  }

  values = () => this._state.values()
  array = () => Array.from(this.values())
  get = <T>(rid: Rid) => this._state.get(rid) as State<T>
  has = (rid: Rid) => this._state.has(rid)

  register<T>(state: State<T>) {
    if (this.has(state.rid)) {
      throw new Error(`State operator rid(${String(state.rid)}) already exists`)
    }

    state.on("change", this._forwardChange)
    this._state.set(state.rid, state)

    return this
  }

  @bind
  private _onUpdate(senses: Senses) {
    for (const state of this._state.values()) {
      if (!state.autoCommit || !state.dirty) continue
      
      state.commit()
    }
  }

  @bind
  private _forwardChange(payload: any) {
    console.log("state changed", payload) // TODO: Remove this log when it is no longer necessary for debug
    this._senses.emit("state.changed", payload)
  }
}
