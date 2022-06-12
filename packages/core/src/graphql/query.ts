import { Device } from "../entities/Device"
import { Room } from "../entities/Room"
import { IEntity } from "../Entity"

export const isDevice = (e: IEntity): e is Device => e.kind === "device"
export const byRoom = (room: Room) => (d: Device) => d.room == room
