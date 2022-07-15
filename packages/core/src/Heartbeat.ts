import EventEmitter from "events";
import bind from "./bind";
import { IController } from "./Entity";

export type HeartbeatMode = "presence" | "ping"

export class Presence extends EventEmitter {
  lastPresence = 0
  lastDeath = 0
  dead: boolean
  private _bindings = new Map<IController, (p: this) => void>()

  constructor(initAlive = false) {
    super()
    this.dead = !initAlive
  }

  markAlive() {
    this.dead = false
    this.lastPresence = Date.now()
    this.emit("change", this)
    this.emit("alive", this)
  }

  markDead() {
    this.dead = true
    this.lastDeath = Date.now()
    this.emit("change", this)
    this.emit("dead", this)
  }

  bindEntity(entity: IController) {
    if (this._bindings.has(entity)) return

    const update = (p: this) => entity.mutate({ available: !p.dead })

    this._bindings.set(entity, update)
    this.on("change", update)
  }

  unbindEntity(entity: IController) {
    const bound = this._bindings.get(entity)

    if (bound) {
      this.off("change", bound)
      this._bindings.delete(entity)
    }
  }
}

export class Heartbeat extends Presence {
  lastPing = 0
  timeout: number

  constructor(timeout = 0, initAlive = false) {
    super(initAlive)
    this.timeout = timeout
    this.dead = true
  }

  @bind
  ping() {
    this.lastPing = Date.now()
    this.emit("ping", this)

    if (this.dead) {
      this.markAlive()
    }
  }

  @bind
  check(): boolean {
    if (this.timeout > 0) {
      if (!this.dead && this.lastPing > Date.now() + this.timeout) {
        this.markDead()
      }
    }

    return this.dead
  }
}
