import { Literal } from "../Entity"
import { Heartbeat, Presence } from "../Heartbeat"
import { ValueMapper } from "../Reactive"
import useMqtt from "./mqtt"
import { onUpdate } from "./senses"

export interface PresenceKeepaliveDescriptor {
  topic: string
  mapper?: ValueMapper
  payload: Literal | ((p: unknown) => boolean)
}

export interface PingKeepaliveDescriptor {
  topic: string
  timeout: number
  mapper?: ValueMapper
  payload?: Literal | ((p: unknown) => boolean)
  deadOnMismatch?: boolean
}

export function definePresenceKeepalive(descriptor: PresenceKeepaliveDescriptor) {
  const heartbeat = new Presence()
  const mapper = descriptor.mapper ?? String
  const mqtt = useMqtt()
  const payload = typeof descriptor.payload === "function"
    ? descriptor.payload
    : (p: unknown) => p === descriptor.payload

  mqtt.subscribe(descriptor.topic, (p) => {
    const ref = mapper(p)

    if (payload(ref)) {
      return heartbeat.markAlive()
    }

    heartbeat.markDead()
  })

  return heartbeat;
}

export function definePingKeepalive(descriptor: PingKeepaliveDescriptor) {
  const heartbeat = new Heartbeat(descriptor.timeout)
  const mapper = descriptor.mapper ?? String
  const mqtt = useMqtt()
  const payload = typeof descriptor.payload === "function"
    ? descriptor.payload
    : (p: unknown) => descriptor.payload == null || p === descriptor.payload

  onUpdate(heartbeat.check)
  mqtt.subscribe(descriptor.topic, (p) => {
    const ref = mapper(p)

    if (payload(ref)) {
      return heartbeat.ping()
    }

    if (descriptor.deadOnMismatch) {
      return heartbeat.markDead()
    }
  })

  return heartbeat
}

export function chainPresence(presences: Presence[], mode: "all" | "any" | "latest") {
  const chained = new Presence()
  const setAvailable = (val: boolean) => val ? chained.markAlive() : chained.markDead()
  const isAlive = (beat: Presence) => !beat.dead

  function precheck(beat: Presence) {
    switch (mode) {
      case "all":
        return setAvailable(presences.every(isAlive))
      case "any":
        return setAvailable(presences.some(isAlive))
      case "latest":
        return setAvailable(beat.dead)
    }
  }

  for (const beat of presences) {
    beat.on("alive", precheck)
    beat.on("dead", precheck)
  }

  return chained
}
