import { defineRoom, useCommand, definePublisher, utils, onMqttConnect, useMqtt, watchProp } from "@senses/core"

const kitchen = defineRoom({
  id: "kuchyne",
  name: "Kuchyně",
});

watchProp(kitchen, {
  name: "temperature",
  topic: "home/kitchen/temperature",
  mapper: Number,
  onSubscribe: () => useMqtt().publish("home/kitchen/temperature/req")
})

useCommand(kitchen, "set:light", definePublisher({ topic: "home/kitchen/lights/set" }))

onMqttConnect(() => utils.executeCommand(kitchen, "set:light", "ON"))

defineRoom({
  id: "loznice",
  name: "Ložnice"
})

defineRoom({
  id: "koupelna",
  name: "Koupelna"
})

defineRoom({
  id: "klidovka",
  name: "Klidová místnost"
})
