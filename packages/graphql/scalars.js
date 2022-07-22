"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLMappedKeys = exports.GraphQLDate = void 0;
const graphql_1 = require("graphql");
const parseDateInt = (value) => parseInt(value);
exports.GraphQLDate = new graphql_1.GraphQLScalarType({
    name: "Date",
    description: "Represents date and time as number format",
    serialize: parseDateInt,
    parseValue: parseDateInt,
    parseLiteral(ast) {
        if (ast.kind !== graphql_1.Kind.INT) {
            throw new TypeError(`Date can't represent non-integer value: ${(0, graphql_1.print)(ast)}`);
        }
        return parseDateInt(ast.value);
    }
});
exports.GraphQLMappedKeys = new graphql_1.GraphQLScalarType({
    name: "MappedKeys",
    description: "Represents an array of key of map, object or dictionary",
    serialize(value) {
        if (typeof value.keys === "function") {
            return Array.from(value.keys());
        }
        return Object.keys(value);
    }
});
