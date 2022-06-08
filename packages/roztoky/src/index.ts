import { defineRoom, defineProp, hookCommand, definePublisher, suite, utils } from "@senses/core"
import { onStart } from "@senses/core/dist/composables/senses"

suite.useDefault();

const kitchen = defineRoom({
  name: "Kuchyně",
  props: {
    temperature: defineProp({ topic: "home/kitchen/temperature", mapper: Number, value: 0 })
  }
});

hookCommand(kitchen, "set:light", definePublisher({ topic: "home/kitchen/lights/set" }))

onStart(() => utils.executeCommand(kitchen, "set:light", "ON"))
