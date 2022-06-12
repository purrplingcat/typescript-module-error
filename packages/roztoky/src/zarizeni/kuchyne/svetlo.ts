import { defineDevice, useCommand, usePublisher } from "@senses/core"
import { kitchen } from "../../mistnosti/kuchyne"

const svetlo = defineDevice({
  id: "svetlo-kuchyne",
  name: "Světlo",
  room: kitchen
})

useCommand(svetlo, "turnOn", usePublisher("home/kuchyne/svetlo/state"))
