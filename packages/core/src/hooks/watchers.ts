import { IController } from "../Entity";
import { Reactive, ValueCondition, ValueMapper } from "../Reactive";
import useLogger from "./logger";
import useMqtt from "./mqtt";

const logError = (err: Error, msg?: string) => useLogger().error(err, msg)

export interface TopicWatchDescriptor<TValue> {
  topic: string
  mapper: ValueMapper<TValue>
  filter?: ValueCondition<TValue>
  onSubscribe?: () => void | Promise<void>
  onError?: (err: Error) => void | Promise<void>
};

export function watchTopic<TValue>(descriptor: TopicWatchDescriptor<TValue>): Reactive<TValue> {
  const reactive = new Reactive<TValue>(descriptor.mapper)
  const mqtt = useMqtt();

  mqtt.subscribe(descriptor.topic, reactive.next)
    .then(descriptor.onSubscribe)
    .catch(descriptor.onError ?? logError)

  return reactive
}

export function watchState<TState extends object>(descriptor: TopicWatchDescriptor<TState> & { entity: IController }) {
  return watchTopic(descriptor)
    .subscribe((v) => descriptor.entity.mutate(v))
}
