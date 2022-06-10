import { GraphQLScalarType, Kind, print } from "graphql";

const parseDateInt = (value: any) => parseInt(value)

export const GraphQLDate = new GraphQLScalarType<number>({
  name: "Date",
  description: "Represents date and time as number format",
  serialize: parseDateInt,
  parseValue: parseDateInt,
  parseLiteral(ast) {
    if (ast.kind !== Kind.INT) {
      throw new TypeError(`Date can't represent non-integer value: ${print(ast)}`)
    }

    return parseDateInt(ast.value)
  }
})

export const GraphQLMappedKeys = new GraphQLScalarType<string[]>({
  name: "MappedKeys",
  description: "Represents an array of key of map, object or dictionary",
  serialize(value: any) {
    if (typeof value.keys === "function") {
      return Array.from(value.keys())
    }

    return Object.keys(value)
  }
})
