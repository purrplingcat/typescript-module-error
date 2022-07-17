type Action<TReq, TRes> = (r: TReq) => TRes | Promise<TRes>
type Condition<TReq> = (r: TReq) => boolean | Promise<boolean>
type Executor<TReq, TRes> = (r: TReq, next: (r: TRes) => Promise<TRes>) => Promise<TRes>

interface ActionChain<TOrigin, TReq, TRes> {
  (req: TOrigin): Promise<void>
  after<T = TRes>(action: Action<TReq, T>): ActionChain<TOrigin, T, T>
  when(condition: Condition<TReq>): ActionChain<TOrigin, TReq, TRes>
}

export function chained<TOrigin, TRes = TOrigin>(): ActionChain<TOrigin, TOrigin, TRes>
export function chained<TOrigin, TRes = TOrigin>(action: Action<TOrigin, TRes>): ActionChain<TOrigin, TRes, TRes>
export function chained<TOrigin, TRes = TOrigin>(action?: Action<TOrigin, TRes>) {
  const actions: Executor<any, any>[] = []
  const chain: ActionChain<TOrigin, TOrigin, TRes> = async (req) => {
    let cursor = 0
    const next = async (r: TOrigin) => {
      if (cursor < actions.length) {
        return await actions[cursor++](r, next)
      }

      return r
    }

    await next(req)
  }

  chain.after = (action) => {
    actions.push(
      async (r, next) => next(await action(r))
    )

    return <any>chain
  }

  chain.when = (condition) => {
    actions.push(async (r, next) => {
      if (await condition(r)) {
        return next(r)
      }

      return r
    })

    return chain
  }

  if (action) {
    return chain.after(<any>action)
  }

  return chain
}

export function fork<TReq, TActions extends Action<TReq, unknown>[] | []>(...actions: TActions): Action<TReq, { [D in keyof TActions]: Awaited<ReturnType<TActions[D]>> }> {
  return (req) => <any>Promise.all(actions.map(async a => await a(req)))
}
