import { Device } from "../entities/Device"
import { Literal } from "../Entity"
import { Heartbeat } from "../Heartbeat"
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
  const heartbeat = new Heartbeat()
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

  onUpdate(() => heartbeat.update())
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

export function chainPresence(heartbeats: Heartbeat[], mode: "all" | "any" | "latest") {
  const chained = new Heartbeat()
  const setAvailable = (val: boolean) => val ? chained.markAlive() : chained.markDead()
  const isAlive = (beat: Heartbeat) => !beat.dead

  function precheck(beat: Heartbeat) {
    switch (mode) {
      case "all":
        return setAvailable(heartbeats.every(isAlive))
      case "any":
        return setAvailable(heartbeats.some(isAlive))
      case "latest":
        return setAvailable(beat.dead)
    }
  }

  for (const beat of heartbeats) {
    beat.on("alive", precheck)
    beat.on("dead", precheck)
  }

  return chained
}

export function usePresence(device: Device, presence: Heartbeat) {
  presence.on("alive", device.update)
  presence.on("dead", device.update)

  return device.presence = presence
}
