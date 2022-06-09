import { defineRoom, defineProp, hookCommand, definePublisher, utils, onMqttConnect, useMqtt } from "@senses/core"

const kitchen = defineRoom({
  id: "kuchyne",
  name: "Kuchyně",
  props: {
    temperature: defineProp({
      topic: "home/kitchen/temperature",
      mapper: Number,
      value: 0,
      onSubscribe: () => useMqtt().publish("home/kitchen/temperature/req")
    })
  }
});

hookCommand(kitchen, "set:light", definePublisher({ topic: "home/kitchen/lights/set" }))

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
