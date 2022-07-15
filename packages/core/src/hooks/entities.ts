import { Command, Controller, IController } from "../Entity"
import { findOneOrCreate, RoomModel } from "../models"
import { IService } from "../Service"
import useLogger from "./logger"
import useSenses from "./senses"
import { useSync } from "./sync"

export type MessageMapper = (v: unknown) => string | Buffer
export type Named = { name: string }

export interface PublisherDescriptor {
  topic: string
  mapper?: MessageMapper
}

export async function defineRoom(opts: any): Promise<Controller<any>> {
  const senses = useSenses();
  const entity = await findOneOrCreate(RoomModel, { id: opts.id }, opts)
  const room = new Controller(`room:${opts.id}`, entity, senses)

  room.on("updated", useSync())
  senses.addEntity(room);

  return room;
}

export function useCommand(entity: IController, name: string, command: Command) {
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
  return function (params: any, entity: IController): void {
    commands.forEach(cmd => cmd(params, entity))
  }
}

export function defineService<P, R>(service: IService<P, R>) {
  const senses = useSenses();

  senses.addService(service)

  return service
}

export async function defineDevice(opts: any) {
  const senses = useSenses();
  const entity = await findOneOrCreate(RoomModel, { id: opts.id }, opts)
  const device = new Controller(`device:${opts.id}`, entity, senses)


  device.on("updated", useSync())
  senses.addEntity(device);

  return device;
}
