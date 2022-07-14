import { Device } from "../entities/Device"
import { Room } from "../entities/Room"
import { IEntity } from "../Entity"

export const isDevice = (e: IEntity): e is Device => e.kind === "device"
export const isRoom = (e: IEntity): e is Room => e.kind === "room"
export const byRoom = (room: Room) => (d: Device) => d.room === room
export const isResident = (e: IEntity): e is any => e.kind === "resident"
export const byType = (type: string) => (d: Device) => !type || d.type === type || d.type?.startsWith(`${type}/`)
