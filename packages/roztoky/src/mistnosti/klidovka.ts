import { configure, defineRoom } from "@senses/core";

export const useRelaxRoom = configure(() => {
  return defineRoom({
    id: "klidovka",
    name: "Klidová místnost"
  })
})
