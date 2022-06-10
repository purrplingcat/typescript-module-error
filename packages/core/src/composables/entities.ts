import { Room, RoomOptions } from "../entities/Room";
import { Command, IEntity, Literal } from "../Entity";
import { Heartbeat } from "../Heartbeat";
import { IService } from "../Service";
import { PipeIO, ValueMapper } from "../State";
import useMqtt from "./mqtt";
import useSenses, { onUpdate } from "./senses";
import useSync from "./sync";

const nop = () => { }

export type MessageMapper = (v: unknown) => string | Buffer
export type Named = { name: string }

export interface WatchDescriptor<TValue> {
  topic: string
  mapper: ValueMapper<TValue>
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

  room.sync = useSync()
  senses.addEntity(room);

  return room;
}

export function watch<TValue>(descriptor: WatchDescriptor<TValue>): PipeIO<TValue> {
  const pipe = new PipeIO<TValue>(descriptor.mapper)
  const mqtt = useMqtt();
  const onSubscribe = descriptor.onSubscribe ?? nop
  const onError = descriptor.onError ?? nop

  mqtt.subscribe(descriptor.topic, pipe.input)
    .then(onSubscribe)
    .catch(onError)

  return pipe
}

export function watchProp<TValue extends Literal>(entity: IEntity, descriptor: Named & WatchDescriptor<TValue>) {
  return watch(descriptor).output((v) => entity.props[descriptor.name] = v)
}

export function useCommand(entity: IEntity, name: string, command: Command) {
  entity.commands.set(name, command);
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
