#! /usr/bin/env node
require(__dirname + "/../.pnp.cjs").setup()

async function bootstrap(moduleName) {
  if (Reflect.has(global, "application")) {
    throw new Error("An application is already running")
  }

  const application = {
    name: moduleName, 
    runtime: "bootstrap",
    resolve: () => Promise.resolve()
      .then(() => require(moduleName)),
    onError: (cb) => {
      process.on("uncaughtException", cb)
      process.on("unhandledRejection", cb)
    }
  }

  Reflect.defineProperty(global, "application", {
    get: () => application,
    configurable: false,
  })

  const mod = require(moduleName)
  const run = mod.run || mod.default || mod
  
  application.meta = mod.meta || {}
  console.log(process.argv)
  await run(process.argv)
}

bootstrap("@senses/app")
