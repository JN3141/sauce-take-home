import { z } from "zod";
import feedbackService from "../service/feedback";
import {
  FIRST_SENTINEL,
  connectionFromArrayWithDbIds,
  DEFAULT_FIRST,
  firstSchema,
  type FirstType,
  type AfterType,
} from "./pagination";
import {
  sauceToGlobalId,
  sauceFromGlobalIdOrThrow
} from "./models";

const feedbackTextSchema = z.string().nonempty();
type FeedbackText = z.infer<typeof feedbackTextSchema>;

/**
 * GraphQL Resolvers
 */
const getFeedback = async (parent: unknown, args: { id: string }) => {
  const idValidated = sauceFromGlobalIdOrThrow(args.id, "Feedback");
  const feedback = await feedbackService.getFeedback(idValidated.id);
  return {
    ...feedback,
    id: sauceToGlobalId("Feedback", feedback.id),
  };
};

const getFeedbacks = async (
  parent: unknown,
  args: { first: FirstType; after: AfterType }
) => {
  const firstValidated = firstSchema.parse(args.first) ?? DEFAULT_FIRST;
  const afterValidated = args.after
    ? sauceFromGlobalIdOrThrow(args.after, "Feedback")
    : undefined;

  const feedbacks = await feedbackService.getFeedbackPage(
    firstValidated + FIRST_SENTINEL,
    afterValidated?.id
  );

  return connectionFromArrayWithDbIds(feedbacks, "Feedback", args);
};

const createFeedback = async (
  parent: unknown,
  args: { text: FeedbackText }
) => {
  const validatedText = feedbackTextSchema.parse(args.text);

  const createdFeedback = await feedbackService.createFeedback(validatedText);
  return {
    ...createdFeedback,
    id: sauceToGlobalId("Feedback", createdFeedback.id),
  };
};

const createFeedbacks = async (
  parent: unknown,
  args: { texts: FeedbackText[] }
) => {
  const validatedTexts = args.texts.map((text) =>
    feedbackTextSchema.parse(text)
  );
  const createdFeedbacks = await feedbackService.createFeedbacks(
    validatedTexts
  );
  return createdFeedbacks.map((feedback) => ({
    ...feedback,
    id: sauceToGlobalId("Feedback", feedback.id),
  }));
};

export default {
  createFeedback,
  createFeedbacks,
  getFeedback,
  getFeedbacks,
};
