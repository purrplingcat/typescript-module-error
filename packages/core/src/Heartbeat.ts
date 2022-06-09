import EventEmitter from "events";

export type HeartbeatMode = "presence" | "ping"

export class Heartbeat extends EventEmitter {
  lastPing: number = 0
  timeout: number
  dead: boolean

  constructor(timeout = 30000) {
    super()
    this.timeout = timeout
    this.dead = true
  }

  update() {
    if (!this.dead && this.lastPing > Date.now() + this.timeout) {
      this.markDead()
    }
  }

  ping() {
    this.lastPing = Date.now()

    if (this.dead) {
      this.markAlive()
    }
  }

  markAlive() {
    this.dead = false
    this.emit("alive", this)
  }

  markDead() {
    this.dead = true
    this.emit("dead", this)
  }
}
