import { configure, defineRoom, onMqttConnect, useCommand, useMessage, usePublisher, utils, watchState } from "@senses/core";

export const useKitchen = configure(() => {
  const kitchen = defineRoom({
    id: "kuchyne",
    name: "Kuchyně",
  });
  
  watchState({
    entity: kitchen,
    topic: "home/kitchen/temperature",
    mapper: (p) => ({ temperature: Number(p) }),
    onSubscribe: useMessage("home/kitchen/temperature/req")
  })
  
  useCommand(kitchen, "set:light", usePublisher("home/kitchen/lights/set"))
  
  onMqttConnect(() => utils.executeCommand(kitchen, "set:light", "ON"))

  return kitchen
})
