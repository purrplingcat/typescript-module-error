import { IEntity } from "../Entity"
import { get } from "../utils"
import useConfig from "./config"

export const decodeJson = (s: string) => s ? JSON.parse(s) : null
export const encodeJson = (p: any) => p === undefined ? JSON.stringify(p) : ""

export function useDecodeJson<V>(mapper = ((v: any) => <V>v)) {
  return (p: string) => mapper(decodeJson(p))
}

export function useEncodeJson<V>(mapper = ((v: V) => <any>v)) {
  return (p: any) => JSON.stringify(mapper(p))
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
