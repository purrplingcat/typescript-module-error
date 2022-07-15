import { Context } from "../context";

const CONTEXT_DEFAULT = Symbol("DEFAULT")
const contexts = new Map<PropertyKey, Context>()

export function useContext(name?: PropertyKey) {
    const context = contexts.get(name ?? CONTEXT_DEFAULT)

    if (!context) {
        throw new Error(`Context ${String(name)} is not created! Create context first with createContext()`)
    }

    return context
}

export function createContext(name?: PropertyKey) {
    if (contexts.has(name ?? CONTEXT_DEFAULT))  {
        throw new Error(`Context ${String(name)} already exists!`)
    }

    const context = new Context()

    contexts.set(name ?? CONTEXT_DEFAULT, context)

    return context
}

// create default context
createContext()
