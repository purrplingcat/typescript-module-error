import { defineDevice, useCommand, usePublisher } from "@senses/core"
import { kitchen } from "../../mistnosti/kuchyne"

const svetlo = defineDevice({
  id: "svetlo-kuchyne",
  name: "Světlo",
  room: kitchen,
  props: {
    __available: true,
    bright: 1
  }
})

useCommand(svetlo, "turnOn", usePublisher("home/kuchyne/svetlo/state"))
