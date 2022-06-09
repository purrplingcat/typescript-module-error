import { gql } from "apollo-server";
import { Senses } from "../Senses";

export interface Context {
  senses: Senses
}

export default gql`
scalar Date
scalar JObject

type Query {
  rooms: [Room]!
  room(id: ID!): Room
}

type Room {
  id: ID!
  name: String
  props: JObject
  lastUpdate: Date
  template: String
}

type Presence {
  lastPresence: Date
  lastDeath: Date
  lastPing: Date
}
`
