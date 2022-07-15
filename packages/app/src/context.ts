import express from "express"
import http from "http"
import { useContext, useConfig } from "@senses/core"

const context = useContext()
const app = express()
const server = http.createServer(app)

context.bind("config", "transient").toFactory(() => useConfig())
context.bind("http.app").toConstantValue(app)
context.bind("http.server").toConstantValue(server)
