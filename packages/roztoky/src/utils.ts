import * as R from "rambda"

export function useIncludes<T>(input: T[]) {
  return (v: T) => R.includes(v, input)
}
