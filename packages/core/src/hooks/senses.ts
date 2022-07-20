import { Senses } from "../Senses";
import useConfig from "./config";
import { useContext } from "./context";

let senses: Senses

export const hook = {
  on: <T>(eventName: string, cb: (...args: T[]) => void) => useSenses().on(eventName, cb),
  once: <T>(eventName: string, cb: (...args: T[]) => void) => useSenses().once(eventName, cb),
  off: <T>(eventName: string, cb: (...args: T[]) => void) => useSenses().off(eventName, cb),
  raise: <T>(eventName: string, ...args: T[]) => useSenses().emit(eventName, args),
}

export function onReady(cb: (senses: Senses, time: number) => void) {
  const senses = useSenses()

  return new Promise<Senses>((resolve) => {
    const onReadyCb = () => {
      cb(senses, senses.readyAt)
      resolve(senses)
    }
    
    if (senses.ready)  {
      return onReadyCb()
    }

    senses.once("start", onReadyCb)
  })
}

export function onStart(cb: (senses: Senses, time: number) => void) {
  useSenses().on("start", cb)
}

export function onUpdate(cb: (senses: Senses) => void) {
  useSenses().on("update", cb)
}

export function nextTick(cb: (senses: Senses) => void) {
  return new Promise<Senses>(resolve => {
    const onNextTick = () => {
      cb(senses)
      resolve(senses)
    }

    useSenses().once("update", onNextTick)
  })
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
