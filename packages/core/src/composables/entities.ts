import { Device, DeviceOptions } from "../entities/Device";
import { Room, RoomOptions } from "../entities/Room";
import { Command, IEntity, Literal } from "../Entity";
import { Heartbeat } from "../Heartbeat";
import { IService } from "../Service";
import { Reactive, ValueCondition, ValueMapper } from "../Reactive";
import useLogger from "./logger";
import useMqtt from "./mqtt";
import useSenses, { onUpdate } from "./senses";
import { useSync } from "./sync";

const logError = (err: Error, msg?: string) => useLogger().error(err, msg)

export type MessageMapper = (v: unknown) => string | Buffer
export type Named = { name: string }

export interface TopicWatchDescriptor<TValue> {
  topic: string
  mapper: ValueMapper<TValue>
  condition?: ValueCondition<TValue>
  onSubscribe?: () => void | Promise<void>
  onError?: (err: Error) => void | Promise<void>
};

export interface PublisherDescriptor {
  topic: string
  mapper?: MessageMapper
}

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

export function defineRoom(opts: RoomOptions): Room {
  const senses = useSenses();
  const room = new Room(opts.id || opts.name, opts.name, senses, opts.props)

  if (opts.template != null) {
    room.template = opts.template
  }

  room.on("updated", useSync())
  senses.addEntity(room);

  return room;
}

export function watchTopic<TValue>(descriptor: TopicWatchDescriptor<TValue>): Reactive<TValue> {
  const reactive = new Reactive<TValue>(descriptor.mapper)
  const mqtt = useMqtt();

  mqtt.subscribe(descriptor.topic, reactive.next)
    .then(descriptor.onSubscribe)
    .catch(descriptor.onError ?? logError)

  return reactive
}

export function watchProp<TValue extends Literal>(entity: IEntity, descriptor: Named & TopicWatchDescriptor<TValue>) {
  return watchTopic(descriptor).subscribe((v) => entity.mutate({ [descriptor.name]: v }))
}

export function useCommand(entity: IEntity, name: string, command: Command) {
  const commandHandler: Command = async (params, entity) => {
    try {
      return command(params, entity)
    } catch (err) {
      useLogger().error(err, `Failed to execute command '${name}' on entity '${entity.id}'`)
    }
  }
  
  entity.commands.set(name, commandHandler);
}

export function mergeCommands(commands: Command[]): Command {
  return function (params: any, entity: IEntity): void {
    commands.forEach(cmd => cmd(params, entity))
  }
}

export function defineService<P, R>(service: IService<P, R>) {
  const senses = useSenses();

  senses.addService(service)

  return service
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
    : (p: unknown) => descriptor.payload != null || p === descriptor.payload

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

export function defineDevice(opts: DeviceOptions) {
  const senses = useSenses();
  const device = new Device(opts.id || opts.name, opts.name, senses, opts.props)

  device.template = opts.template ?? ""
  device.room = opts.room
  device.on("updated", useSync())

  senses.addEntity(device);

  return device;
}
