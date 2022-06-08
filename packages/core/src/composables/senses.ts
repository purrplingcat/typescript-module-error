import { Senses } from "../Senses";
import useConfig from "./config";

let senses: Senses

export function onStart(cb: (senses: Senses, time: number) => void) {
  useSenses().on("start", cb);
}

export function onUpdate(cb: (senses: Senses) => void) {
  useSenses().on("update", cb);
}

export default function useSenses(): Senses {
  if (!senses) {
    const config = useConfig()

    senses = new Senses()
    senses.tps = config.tps
  }

  return senses;
}
