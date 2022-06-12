import { get } from "../utils"
import useConfig from "./config"

export const decodeJson = (s: string | Buffer) => s ? JSON.parse(<string>s) : null
export const encodeJson = (p: any) => typeof p !== "undefined" ? JSON.stringify(p) : ""

export function useDecodeJson<V>(mapper = ((v: any) => <V>v)) {
  return (p: unknown) => mapper(decodeJson(<string>p))
}

export function useEncodeJson<V>(mapper = ((v: V) => <any>v)) {
  return (p: V) => JSON.stringify(mapper(p))
}

export function useWith<T, R>(what: T, action: (what: T) => R) {
  return () => action(what)
}

export function domain() {
  return get(useConfig(), "domain", "home")
}

export function topic(topic: string) {
  return `${domain()}/${topic}`
}
