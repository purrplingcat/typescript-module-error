import { configure } from "@senses/core";
import { defineRoom } from "@senses/core/hooks"

export const useBathroom = configure(() => {
  return defineRoom({
    id: "koupelna",
    name: "Koupelna"
  })
})
