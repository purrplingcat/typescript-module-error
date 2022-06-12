import { gql } from "apollo-server";
import { Senses } from "../Senses";

export interface Context {
  senses: Senses
}

export default gql`
scalar Date
scalar JObject
scalar Keys

type Query {
  rooms: [Room]!
  room(id: ID!): Room
}

type Room {
  id: ID!
  name: String
  props: JObject!
  lastUpdate: Date
  template: String
  devices: [Device!]
  commands: [String]
}

type Device {
  id: ID!
  name: String
  state: String
  available: Boolean
  props: JObject!
  type: String!
  lastUpdate: Date
  template: String
  widget: String
  presence: Presence
  features: [String]
  commands: [String]
  room: Room
}

type Presence {
  lastPresence: Date
  lastDeath: Date
  lastPing: Date
}
`
