import useSenses from "./senses"
import { Rid, State } from "../components/state"
import { isNil } from "../utils"

export type MessageMapper = (v: unknown) => string | Buffer
export type Named = { name: string }

export interface PublisherDescriptor {
  topic: string
  mapper?: MessageMapper
}

export function defineState<T>(rid: Rid, initialData: T): State<T> {
  const senses = useSenses()
  const state = new State(rid, initialData)

  senses.stateManager.register(state)

  return state as State<T>
}

export function useState<T>(rid: Rid) {
  const state = useSenses().stateManager.get(rid)

  if (isNil(state)) {
    throw new Error(`Undefined state operator rid(${String(rid)})`)
  }

  return <State<T>>state
}

/*export function useCommand<T extends Entity>(entity: EntityController<T>, name: string, command: Command<T>) {
  const commandHandler: Command<T> = async (params, entity) => {
    try {
      return command(params, entity)
    } catch (err) {
      useLogger().error(err, `Failed to execute command '${name}' on entity '${entity.rid}'`)
    }
  }
  
  entity.commands.set(name, commandHandler);
}

export function mergeCommands<T extends Entity>(commands: Command<T>[]): Command<T> {
  return function (params: any, entity: EntityController<T>): void {
    commands.forEach(cmd => cmd(params, entity))
  }
}*/
