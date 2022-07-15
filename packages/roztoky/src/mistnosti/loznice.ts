import { configure, defineRoom } from "@senses/core";

export const useBedroom = configure(() => {
  return defineRoom({
    id: "loznice",
    name: "Ložnice"
  })
})
