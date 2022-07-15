import mongoose from "mongoose"

export const roomSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true, immutable: true },
    name: String,
    lastUpdate: Date,
    temperature: Number,
})

export const RoomModel = mongoose.model("Room", roomSchema)
