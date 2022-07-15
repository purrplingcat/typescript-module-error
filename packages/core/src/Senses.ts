import EventEmitter from "events";
import useLogger from "./hooks/logger";
import { IEntity, Uid } from "./Entity";
import { isResident } from "./graphql/query";
import { IService } from "./Service";

const logger = useLogger();

export interface Mode {
  preset: string
  secured: boolean
  presence: "home" | "away" | "vacation" | "auto"
}

export class Senses extends EventEmitter {
  tps = 20
  entities: Map<Uid, IEntity> = new Map()
  services: Map<Uid, IService> = new Map()
  private _mode: Readonly<Mode>

  private _night = false
  private _isReady = false
  private _timeout: NodeJS.Timeout | null = null
  private loop = () => {
    this.update()
    this._timeout = setTimeout(this.loop, 1000 / this.tps)
  }

  constructor() {
    super()
    this._mode = Object.freeze<Mode>({
      preset: "",
      secured: false,
      presence: "auto"
    })
  }

  get mode(): Mode {
    return this._mode
  }

  get presence() {
    if (this.mode.presence != "auto") {
      return this.mode.presence
    }

    const isAnybodyHome = this.getEntities()
      .filter(isResident)
      .some((r) => r.isHome)

    return isAnybodyHome ? "home" : "away"
  }

  isReady = () => this._isReady
  isNight = () => this._night
  isDay = () => !this._night

  switchNight() {
    this.emit("night", this)
    this._night = true
  }

  switchDay() {
    this.emit("day", this)
    this._night = false
  }

  changeMode(newMode: Partial<Mode>) {
    const oldMode = this._mode
    const toUpdate = { ...this._mode, ...newMode }

    this._mode = Object.freeze<Mode>(toUpdate)
    this.emit("mode", oldMode, this._mode)
  }

  addEntity(entity: IEntity) {
    if (this.entities.has(entity.id)) {
      throw new Error(`Entity ${entity.id} already exists`);
    }

    this.entities.set(entity.id, entity);
  }

  addService(service: IService) {
    if (this.services.has(service.id)) {
      throw new Error(`Service ${service.id} already exists`);
    }

    this.services.set(service.id, service);
  }

  getEntities(): IEntity[] {
    return Array.from(this.entities.values());
  }

  start()
  {
    if (this._timeout) {
      clearTimeout(this._timeout)
    }

    this.loop()
    this._isReady = true
    this.emit("start", this, Date.now())
    logger.info("Senses controller is ready")
  }

  update() {
    if (!this._isReady) { return }

    this.emit("update", this)
  }
}
