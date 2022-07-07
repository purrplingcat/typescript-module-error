import EventEmitter from "events";

export type HeartbeatMode = "presence" | "ping"

export class Heartbeat extends EventEmitter {
  lastPing = 0
  lastPresence = 0
  lastDeath = 0
  timeout: number
  dead: boolean

  constructor(timeout = 0) {
    super()
    this.timeout = timeout
    this.dead = true
  }

  update() {
    this.emit("update", this)

    if (this.timeout > 0) {
      if (!this.dead && this.lastPing > Date.now() + this.timeout) {
        this.markDead()
      }
    }
  }

  ping() {
    this.lastPing = Date.now()
    this.emit("ping", this)

    if (this.dead) {
      this.markAlive()
    }
  }

  markAlive() {
    this.dead = false
    this.lastPresence = Date.now()
    this.emit("alive", this)
  }

  markDead() {
    this.dead = true
    this.lastDeath = Date.now()
    this.emit("dead", this)
  }
}
