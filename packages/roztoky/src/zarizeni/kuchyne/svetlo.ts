import { defineDevice, useCommand, usePublisher } from "@senses/core"
import { kitchen } from "../../mistnosti/kuchyne"

const svetlo = defineDevice({
  id: "svetlo-kuchyne",
  name: "Světlo",
  type: "light",
  room: kitchen,
  props: {
    bright: 1
  }
})

useCommand(svetlo, "turnOn", usePublisher("home/kuchyne/svetlo/state"))
