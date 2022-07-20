import { Presence } from "../components";
import { State } from "../components/state";

export function usePresence(state: State<any>) {
  const presence = new Presence()

  presence.on("presence", (available) => {
    if (available !== state.data._available) {
      state.draft({
        _available: available,
        _lastOnline: available 
          ? Date.now() 
          : state.data._lastOnline
      })
    }
  })

  return presence
}
