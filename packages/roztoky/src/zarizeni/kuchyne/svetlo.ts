import { configure, defineDevice, useCommand, usePublisher } from "@senses/core"
import { useKitchen } from "../../mistnosti/kuchyne"

configure(async () => {
  const kitchen = await useKitchen()
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
})
