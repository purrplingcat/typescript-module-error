import { IClientSubscribeOptions } from "mqtt";
import { Observable, Subscriber, TeardownLogic } from "rxjs";
import useLogger from "./logger";
import useMqtt from "./mqtt";

const logError = (err: Error, msg?: string) => useLogger().error(err, msg)

export interface SubscriptionOptions extends IClientSubscribeOptions {
  onSubscribe?: () => void | Promise<void>
};

export function watch<T>(subscribe: (this: Observable<T>, subscriber: Subscriber<T>) => TeardownLogic) {
  const observable = new Observable<T>(subscribe)
  
  observable.subscribe({
    error: logError
  })

  return observable
}

export function watchTopic(topic: string, options?: SubscriptionOptions) {
  return watch(subscriber => {
    useMqtt().subscribe(topic, p => subscriber.next(p), options)
      .then(options?.onSubscribe)
      .catch((err) => subscriber.error(err))
  })
}
