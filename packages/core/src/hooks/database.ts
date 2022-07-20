import mongoose from "mongoose"

export const useDbConnection = () => mongoose.connection
