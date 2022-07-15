import { IEntity, Uid } from "../Entity";
import { Senses } from "../Senses";
import useConfig from "./config";
import { useContext } from "./context";

let senses: Senses

export function onStart(cb: (senses: Senses, time: number) => void) {
  useSenses().on("start", cb)
}

export function onUpdate(cb: (senses: Senses) => void) {
  useSenses().on("update", cb)
}

export function nextTick(cb: (senses: Senses) => void) {
  useSenses().once("update", cb)
}

export function addEntity(entity: IEntity) {
  useSenses().addEntity(entity)
}

export function useEntity(id: Uid) {
  return useSenses().entities.get(id)
}

function createSenses() {
  const config = useConfig()

  senses = new Senses()
  senses.tps = config.tps

  return senses
}

export default function useSenses(): Senses {
  return useContext().resolve("senses", createSenses)
}
