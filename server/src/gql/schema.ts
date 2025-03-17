import {makeExecutableSchema} from "@graphql-tools/schema";
import typeDefs from "./typedefs";
import resolvers from "./resolvers";

/**
 * GraphQL schema
 */
export const schema = makeExecutableSchema({
  resolvers: [resolvers],
  typeDefs: [typeDefs]
});
