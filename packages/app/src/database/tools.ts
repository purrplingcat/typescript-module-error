import mongoose, { ConnectOptions, Model, FilterQuery } from "mongoose"
import { useLogger } from "@senses/core/hooks"

let hookedOnEvents = false

export async function connectDb(uri: string, options?: ConnectOptions) {
  const logger = useLogger("mongo")

  if (!hookedOnEvents) {
    mongoose.connection.on("error", (err) => logger.error("Error in mongo db connection", err))
    mongoose.connection.on("reconnected", () => logger.info("Mongo db connection is back"))
    mongoose.connection.on("disconnected", () => logger.warn("Mongo db connection lost"))
  }

  logger.info("Connecting to mongo database ...")
  const conn = await mongoose.connect(uri ?? "mongodb://localhost/senses", options)
  logger.info("Mongo database connected")

  return conn
}

export async function findOneOrCreate<T>(model: Model<T>, filter: FilterQuery<T>, doc: T) {
  const found = await model.findOne(filter)

  if (found) return found

  return model.create(doc)
}
