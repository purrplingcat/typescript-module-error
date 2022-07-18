import { configure } from "@senses/core";
import { defineRoom } from "@senses/core/hooks"

export const useRelaxRoom = configure(() => {
  return defineRoom({
    id: "klidovka",
    name: "Klidová místnost"
  })
})
