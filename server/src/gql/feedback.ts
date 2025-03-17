import feedbackService from "../service/feedback";
import {
  sauceToGlobalId,
  sauceFromGlobalId,
  FIRST_SENTINEL,
  connectionFromArrayWithDbIds,
  DEFAULT_FIRST,
} from "./utils";

const MAX_FIRST = 50;

/**
 * GraphQL Resolvers
 */
const getFeedback = async (parent: unknown, args: { id: number }) => {
  const feedback = await feedbackService.getFeedback(args.id);
  return {
    ...feedback,
    id: sauceToGlobalId("Feedback", feedback.id),
  };
};

const getFeedbacks = async (
  parent: unknown,
  args: { first: number | null; after: string | null }
) => {
  if (args.first && args.first > MAX_FIRST) {
    throw new Error("First argument exceeds maximum.");
  }

  const firstValidated = Math.min(args.first ?? DEFAULT_FIRST, MAX_FIRST);

  const afterValidated = args.after ? sauceFromGlobalId(args.after) : undefined;

  if (afterValidated) {
    if (afterValidated.type !== "Feedback") {
      throw new Error("Invalid after global ID.");
    }
  }

  const feedbacks = await feedbackService.getFeedbackPage(
    firstValidated + FIRST_SENTINEL,
    afterValidated?.id
  );

  return connectionFromArrayWithDbIds(feedbacks, "Feedback", args);
};

const createFeedback = async (parent: unknown, args: { text: string }) => {
  const createdFeedback = await feedbackService.createFeedback(args.text);
  return {
    ...createdFeedback,
    id: sauceToGlobalId("Feedback", createdFeedback.id),
  };
};

export default {
  createFeedback,
  getFeedback,
  getFeedbacks,
};
