import EventEmitter from "events";
import useLogger from "./composables/logger";
import { IEntity, Uid } from "./Entity";
import { IService } from "./Service";

const logger = useLogger();

export interface Mode {
  night: boolean
  security: "unsupported" | "unsecured" | "secured"
  presence: "home" | "away" | "vacation" | "auto"
}

export class Senses extends EventEmitter {
  tps = 20
  entities: Map<Uid, IEntity> = new Map()
  services: Map<Uid, IService> = new Map()
  mode: Readonly<Mode>

  private _isReady = false
  private _timeout: NodeJS.Timeout | null = null
  private loop = () => {
    this.update()
    this._timeout = setTimeout(this.loop, 1000 / this.tps)
  }

  constructor() {
    super()
    this.mode = Object.freeze<Mode>({
      night: false,
      security: "unsupported",
      presence: "auto"
    })
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
