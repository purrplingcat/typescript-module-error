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
