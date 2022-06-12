import { defineRoom, onMqttConnect, useCommand, useMessage, usePublisher, utils, watchProp } from "@senses/core";

export const kitchen = defineRoom({
  id: "kuchyne",
  name: "Kuchyně",
});

watchProp(kitchen, {
  name: "temperature",
  topic: "home/kitchen/temperature",
  mapper: Number,
  onSubscribe: useMessage("home/kitchen/temperature/req")
})

useCommand(kitchen, "set:light", usePublisher("home/kitchen/lights/set"))

onMqttConnect(() => utils.executeCommand(kitchen, "set:light", "ON"))
