import mongoose from "mongoose"

export interface RoomData {
  id: string
  name?: string
  temperature?: number
}

export const roomSchema = new mongoose.Schema<RoomData>({
    id: { type: String, unique: true, required: true, immutable: true },
    name: String,
    temperature: Number,
})

export const RoomModel = mongoose.model("Room", roomSchema)
console.log(RoomModel.schema === roomSchema)
