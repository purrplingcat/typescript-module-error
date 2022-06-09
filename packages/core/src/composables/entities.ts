import { Room, RoomOptions } from "../entities/Room";
import { Command, IEntity, Literal } from "../Entity";
import { Heartbeat } from "../Heartbeat";
import { IService } from "../Service";
import { StateProp } from "../State";
import useMqtt from "./mqtt";
import useSenses, { onUpdate } from "./senses";
import useSync from "./sync";

const nop = () => {}

export type ValueMapper<TValue = any> = (v: unknown) => TValue;
export type MessageMapper = (v: unknown) => string | Buffer

export interface PropDescriptor<TValue> {
  topic: string
  value: TValue
  mapper: ValueMapper<TValue>
  onSubscribe?: () => void
  onError?: (err: Error) => void
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
  const room = new Room(opts.id || opts.name, opts.name, senses)

  if (opts.props) {
    for (const name of Object.keys(opts.props)) {
      room.bindProp(name, opts.props[name])
    }
  }

  if (opts.template != null) {
    room.template = opts.template
  }
  
  room.sync = useSync()
  senses.addEntity(room);

  return room;
}

export function defineProp<TValue>(descriptor: PropDescriptor<TValue>): StateProp<TValue> {
  const state = new StateProp(descriptor.value);
  const mqtt = useMqtt();
  const onSubscribe = descriptor.onSubscribe ?? nop
  const onError = descriptor.onError ?? nop

  mqtt.subscribe(descriptor.topic, (p) => state.value = descriptor.mapper(p))
    .then(onSubscribe)
    .catch(onError)

  return state;
}

export function definePublisher(descriptor: PublisherDescriptor): (v: Literal) => Promise<void> {
  const mapper = descriptor.mapper ?? String
  const mqtt = useMqtt()

  return (v: Literal) => mqtt.publish(descriptor.topic, mapper(v))
}

export function hookCommand(entity: IEntity, name: string, command: Command)
{
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
