import feedbackService from "../service/feedback";

/**
 * GraphQL Resolvers
 */
const resolvers = {
  Query: {
    feedback: (parent: unknown, args: { id: number }) => {
      return feedbackService.getFeedback(args.id);
    },
    feedbacks: (parent: unknown, args: { page: number; per_page: number }) => {
      return feedbackService.getFeedbackPage(args.page, args.per_page);
    },
  },
  Mutation: {
    createFeedback: (parent: unknown, args: { text: string }) => {
      return feedbackService.createFeedback(args.text);
    },
  },
  Feedback: {
    highlights: () => {
      return [];
    },
  },
};

export default resolvers;
