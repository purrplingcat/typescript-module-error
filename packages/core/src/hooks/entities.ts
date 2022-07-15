import { Device, DeviceOptions } from "../entities/Device";
import { Room, RoomOptions } from "../entities/Room";
import { Command, IEntity, Literal } from "../Entity";
import { IService } from "../Service";
import { ValueCondition, ValueMapper } from "../Reactive";
import useLogger from "./logger";
import useSenses from "./senses";
import { useSync } from "./sync";

export type MessageMapper = (v: unknown) => string | Buffer
export type Named = { name: string }

export interface PublisherDescriptor {
  topic: string
  mapper?: MessageMapper
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

export function defineDevice(opts: DeviceOptions) {
  const senses = useSenses();
  const device = new Device(opts.id || opts.name, opts.name, senses, opts.props)

  device.type = opts.type
  device.template = opts.template ?? ""
  device.room = opts.room
  device.on("updated", useSync())

  senses.addEntity(device);

  return device;
}
