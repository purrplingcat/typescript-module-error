import { Uid } from "./Entity";
import { Senses } from "./Senses";

export type ServiceResult<R> = {
  status: number
  message: string
  payload?: R
}

export interface IService<P = any, R = any> {
  id: Uid
  name?: string
  description?: string
  call(payload: P, senses: Senses): ServiceResult<R> | Promise<ServiceResult<R>>
}
