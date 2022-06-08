import EventEmitter from "events";
import { IEntity } from "../Entity";
import { onUpdate } from "./senses";

let queue: Set<IEntity>
const bus = new EventEmitter()

export interface Sync {
  queue: Set<IEntity>;
  push: (e: IEntity) => Set<IEntity>;
  remove: (e: IEntity) => boolean;
  onSync: (cb: (ents: IEntity[]) => void) => void;
}

export default function useSync(): Sync {
  if (!queue) {
    queue = new Set();
    onUpdate(() => {
      bus.emit("sync", Array.from(queue))
      queue.forEach((e) => e.markClean())
      queue.clear()
    })
  }

  return {
    queue,
    push: (e: IEntity) => queue.add(e),
    remove: (e: IEntity) => queue.delete(e),
    onSync: (cb: (ents: IEntity[]) => void) => bus.on("sync", cb)
  }
}
