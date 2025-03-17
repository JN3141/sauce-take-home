import {
  fromGlobalId,
  toGlobalId,
  type ConnectionArguments,
  type Connection,
} from "graphql-relay";

export const DEFAULT_FIRST = 10;
export const FIRST_SENTINEL = 1;

export const graphQLTypes = ["Feedback", "Highlight"] as const;
export type GraphQLType = (typeof graphQLTypes)[number];

export type GraphQLNode = { id: string };

function isGraphQLType(
  maybeGraphQLType: unknown
): maybeGraphQLType is GraphQLType {
  return (
    typeof maybeGraphQLType === "string" &&
    graphQLTypes.some((graphQLType) => maybeGraphQLType === graphQLType)
  );
}

export const sauceFromGlobalId = (globalId: string) => {
  const maybeGlobalId = fromGlobalId(globalId);

  if (!isGraphQLType(maybeGlobalId.type)) {
    throw new Error("Invalid global ID.");
  }

  const maybeInt = parseInt(maybeGlobalId.id);
  if (Number.isNaN(maybeInt)) {
    throw new Error("Invalid global ID.");
  }

  return {
    id: maybeInt,
    type: maybeGlobalId.type,
  };
};

export const sauceToGlobalId = (type: GraphQLType, id: number | bigint) =>
  toGlobalId(type, id as number);

export function connectionFromArrayWithDbIds<T extends { id: number }>(
  data: Array<T>,
  nodeType: GraphQLType,
  args: ConnectionArguments
): Connection<T> {
  // Get the limit from args
  const { first } = args;
  const limit = first || DEFAULT_FIRST;

  // Check if we have more items than requested (we added FIRST_SENTINEL extra)
  const hasNextPage = data.length > limit;

  // Remove the extra item we used to check for hasNextPage, and convert to
  // global IDs
  const edges = data.slice(0, limit).map((node) => {
    const nodeGlobalId = sauceToGlobalId(nodeType, node.id);
    return {
      cursor: nodeGlobalId,
      node: {
        ...node,
        id: nodeGlobalId,
      },
    };
  });

  return {
    edges,
    pageInfo: {
      hasNextPage,
      hasPreviousPage: false, // Since we're only implementing forward pagination
      startCursor: edges.length > 0 ? edges[0].cursor : null,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
    },
  };
}
