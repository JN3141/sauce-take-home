import feedbackResolvers from "./feedback";
import highlightResolvers from "./highlight";

/**
 * GraphQL Resolvers
 */
const resolvers = {
  Query: {
    feedback: feedbackResolvers.getFeedback,
    feedbacks: feedbackResolvers.getFeedbacks,
  },
  Mutation: {
    createFeedback: feedbackResolvers.createFeedback,
    createFeedbacks: feedbackResolvers.createFeedbacks,
  },
  Feedback: {
    highlights: highlightResolvers.getFeedbackHighlights,
  },
};

export default resolvers;
