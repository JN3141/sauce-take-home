import {
  type ConnectionArguments,
  type Connection,
} from "graphql-relay";
import { SauceGraphQLType, sauceToGlobalId } from "./models";
import { z } from "zod";

export const DEFAULT_FIRST = 10;
export const FIRST_SENTINEL = 1;

export const firstSchema = z.number().int().min(1).max(50).nullish();
export type FirstType = z.infer<typeof firstSchema>;
export const afterSchema = z.string().nonempty().nullish();
export type AfterType = z.infer<typeof afterSchema>;
  
export function connectionFromArrayWithDbIds<T extends { id: number | bigint }>(
  data: Array<T>,
  nodeType: SauceGraphQLType,
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
