import EventEmitter from "events";
import { IEntity } from "../Entity";
import { onUpdate } from "./senses";

let syncer: Sync

export interface Sync {
  queue: Set<IEntity>;
  push: (e: IEntity) => Set<IEntity>;
  remove: (e: IEntity) => boolean;
  onSync: (cb: (ents: IEntity[]) => void) => void;
}

export function createSync(): Sync {
  const bus = new EventEmitter()
  const queue = new Set<IEntity>()

  onUpdate(() => {
    if (!queue.size) { return }
    bus.emit("sync", Array.from(queue))
    queue.clear()
  })

  return {
    queue,
    push: (e: IEntity) => queue.add(e),
    remove: (e: IEntity) => queue.delete(e),
    onSync: (cb: (ents: IEntity[]) => void) => bus.on("sync", cb)
  }
}

export function sync(entity?: IEntity) {
  if (!syncer) {
    syncer = createSync()
  }

  if (entity) {
    syncer.push(entity)
  }

  return syncer
}

export function useSync() {
  return (entity: IEntity) => sync(entity)
}

export function onSyncAll(cb: (ents: IEntity[]) => void) {
  sync().onSync(cb)
}

export function onSync(cb: (e: IEntity) => void) {
  onSyncAll((ents) => 
    ents.forEach((e) => cb(e))
  )
}
