import EventEmitter from "events";
import useLogger from "./composables/logger";
import { IEntity, Uid } from "./Entity";
import { IService } from "./Service";

const logger = useLogger();

export class Senses extends EventEmitter {
  tps = 20
  entities: Map<Uid, IEntity> = new Map()
  dirtyEntities: Set<IEntity> = new Set()
  services: Map<Uid, IService> = new Map()

  private _isReady = false
  private _timeout: NodeJS.Timeout | null = null
  private loop = () => {
    this.update()
    this._timeout = setTimeout(this.loop, 1000 / this.tps)
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

    if (this.dirtyEntities.size > 0) {
      this.emit("entity.updated", Array.from(this.dirtyEntities))
      this.dirtyEntities.forEach(d => d.markClean())
      this.dirtyEntities.clear()
    }

    this.emit("update", this)
  }
}
