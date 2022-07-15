import mongoose, { ConnectOptions, Model, FilterQuery } from "mongoose"
import { Uid } from "../Entity"
import { useLogger } from "../hooks"

export async function connectDb(uri: string, options?: ConnectOptions) {
  const logger = useLogger("mongo")

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

export * from "./Room"
