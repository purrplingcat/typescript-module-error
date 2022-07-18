import { configure } from "@senses/core";
import { defineRoom } from "@senses/core/hooks"

export const useBedroom = configure(() => {
  return defineRoom({
    id: "loznice",
    name: "Ložnice"
  })
})
