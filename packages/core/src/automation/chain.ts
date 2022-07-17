type Action<TReq, TRes> = (r: TReq) => TRes | Promise<TRes>
type Condition<TReq> = (r: TReq) => boolean | Promise<boolean>
type Executor<TReq, TRes> = (r: TReq, next: (r: TRes) => Promise<TRes>) => Promise<TRes>

interface ActionChain<TOrigin, TReq, TRes> {
  (req: TOrigin): Promise<void>
  follows<T = TRes>(action: Action<TReq, T>): ActionChain<TOrigin, T, T>
  when(condition: Condition<TReq>): ActionChain<TOrigin, TReq, TRes>
}

export function chain<TOrigin, TRes = TOrigin>(): ActionChain<TOrigin, TOrigin, TRes>
export function chain<TOrigin, TRes = TOrigin>(action: Action<TOrigin, TRes>): ActionChain<TOrigin, TRes, TRes>
export function chain<TOrigin, TRes = TOrigin>(action?: Action<TOrigin, TRes>) {
  const actions: Executor<any, any>[] = []
  const chained: ActionChain<TOrigin, TOrigin, TRes> = async (req) => {
    let cursor = 0
    const next = async (r: TOrigin) => {
      if (cursor < actions.length) {
        return await actions[cursor++](r, next)
      }

      return r
    }

    await next(req)
  }

  chained.follows = (action) => {
    actions.push(
      async (r, next) => next(await action(r))
    )

    return <any>chained
  }

  chained.when = (condition) => {
    actions.push(async (r, next) => {
      if (await condition(r)) {
        return next(r)
      }

      return r
    })

    return chained
  }

  if (action) {
    return chained.follows(<any>action)
  }

  return chained
}

export function fork<TReq, TActions extends Action<TReq, unknown>[] | []>(...actions: TActions): Action<TReq, { [D in keyof TActions]: Awaited<ReturnType<TActions[D]>> }> {
  return (req) => <any>Promise.all(actions.map(async a => await a(req)))
}
