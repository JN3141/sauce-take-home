import {
  fromGlobalId,
  toGlobalId,
  type ConnectionArguments,
  type Connection,
} from "graphql-relay";
import feedbackService from "../service/feedback";
import highlightService from "../service/highlight";
import { Feedback } from "../store/model";

const graphQLTypes = ["Feedback", "Highlight"] as const;
type GraphQLType = (typeof graphQLTypes)[number];

const MAX_FIRST = 50;
const DEFAULT_FIRST = 10;
const FIRST_SENTINEL = 1;

function isGraphQLType(
  maybeGraphQLType: unknown
): maybeGraphQLType is GraphQLType {
  return (
    typeof maybeGraphQLType === "string" &&
    graphQLTypes.some((graphQLType) => maybeGraphQLType === graphQLType)
  );
}

const sauceFromGlobalId = (globalId: string) => {
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

const sauceToGlobalId = (type: GraphQLType, id: string | number) =>
  toGlobalId(type, id);

function connectionFromArrayWithDbIds<T extends { id: string | number }>(
  data: Array<T>,
  args: ConnectionArguments
): Connection<T> {
  // Get the limit from args
  const { first } = args;
  const limit = first || DEFAULT_FIRST;

  // Check if we have more items than requested (we added FIRST_SENTINEL extra)
  const hasNextPage = data.length > limit;

  // Remove the extra item we used to check for hasNextPage, and convert to
  // global IDs
  const edges = data.slice(0, limit).map((node, index) => ({
    cursor: sauceToGlobalId("Feedback", node.id),
    node,
  }));

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

/**
 * GraphQL Resolvers
 */
const resolvers = {
  Query: {
    feedback: async (parent: unknown, args: { id: number }) => {
      const feedback = await feedbackService.getFeedback(args.id);
      return {
        ...feedback,
        id: sauceToGlobalId("Feedback", feedback.id),
      };
    },
    feedbacks: async (
      parent: unknown,
      args: { first: number | null; after: string | null }
    ) => {
      if (args.first && args.first > MAX_FIRST) {
        throw new Error("First argument exceeds maximum.");
      }

      const firstValidated = Math.min(args.first ?? DEFAULT_FIRST, MAX_FIRST);

      const afterValidated = args.after
        ? sauceFromGlobalId(args.after)
        : undefined;

      if (afterValidated) {
        if (afterValidated.type !== "Feedback") {
          throw new Error("Invalid after global ID.");
        }
      }

      const feedbacks = await feedbackService.getFeedbackPage(
        firstValidated + FIRST_SENTINEL,
        afterValidated?.id
      );

      return connectionFromArrayWithDbIds(feedbacks, args);
    },
  },
  Mutation: {
    createFeedback: (parent: unknown, args: { text: string }) => {
      return feedbackService.createFeedback(args.text);
    },
  },
  Feedback: {
    highlights: (parent: Feedback) => {
      return highlightService.getFeedbackHighlights(parent.id);
    },
  },
};

export default resolvers;
