import { configure, utils } from "@senses/core";
import { defineRoom, onMqttConnect, useCommand, useMessage, usePublisher, watchState } from "@senses/core/hooks"

export const useKitchen = configure(async () => {
  const kitchen = await defineRoom({
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
