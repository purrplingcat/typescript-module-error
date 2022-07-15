import EventEmitter from "events";
import { IController } from "../Entity";
import { useContext } from "./context";
import { onUpdate } from "./senses";

export interface Sync {
  queue: Set<IController>;
  push: (e: IController) => Set<IController>;
  remove: (e: IController) => boolean;
  onSync: (cb: (ents: IController[]) => void) => void;
}

export function createSync(): Sync {
  const bus = new EventEmitter()
  const queue = new Set<IController>()

  onUpdate(() => {
    if (!queue.size) { return }
    bus.emit("sync", Array.from(queue))
    queue.clear()
  })

  return {
    queue,
    push: (e: IController) => queue.add(e),
    remove: (e: IController) => queue.delete(e),
    onSync: (cb: (ents: IController[]) => void) => bus.on("sync", cb)
  }
}

export function sync(entity?: IController) {
  const syncer = useContext().resolve("sync", createSync)

  if (entity) {
    syncer.push(entity)
  }

  return syncer
}

export function useSync() {
  return (entity: IController) => sync(entity)
}

export async function onSyncAll(cb: (ents: IController[]) => void) {
  sync().onSync(cb)
}

export async function onSync(cb: (e: IController) => void) {
  onSyncAll((ents) => 
    ents.forEach((e) => cb(e))
  )
}
