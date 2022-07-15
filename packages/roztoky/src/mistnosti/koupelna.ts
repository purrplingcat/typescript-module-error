import { configure, defineRoom } from "@senses/core";

export const useBathroom = configure(() => {
  return defineRoom({
    id: "koupelna",
    name: "Koupelna"
  })
})
