import { Room, RoomOptions } from "../entities/Room";
import { Command, IEntity, Literal } from "../Entity";
import { IService } from "../Service";
import { StateProp } from "../State";
import useMqtt from "./mqtt";
import useSenses from "./senses";
import useSync from "./sync";

export interface StateDescriptor<TValue> {
  topic: string
  value: TValue,
  mapper: (v: unknown) => TValue,
};

export interface PublisherDescriptor {
  topic: string;
  mapper?: (v: Literal) => string | Buffer
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

export function defineProp<TValue>(descriptor: StateDescriptor<TValue>): StateProp<TValue> {
  const state = new StateProp(descriptor.value);
  const mqtt = useMqtt();

  mqtt.subscribe(descriptor.topic, (p) => state.value = descriptor.mapper(p))

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
