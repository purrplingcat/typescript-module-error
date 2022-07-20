import { configure } from "@senses/core";
import { defineState, useMessage, watchTopic } from "@senses/core/hooks"
import { map } from "rxjs";

export const useKitchen = configure(async () => {
  const kitchen = defineState("room:kitchen", {})
  
  watchTopic("home/kitchen/temperature", { qos: 0, onSubscribe: useMessage("home/kitchen/temperature/req") })
    .pipe(map(Number))
    .subscribe((temperature) => kitchen.draft({ temperature }))
  
  // useCommand(kitchen, "set:light", usePublisher("home/kitchen/lights/set"))
  
  // onMqttConnect(() => utils.executeCommand(kitchen, "set:light", "ON"))

  return kitchen
})
