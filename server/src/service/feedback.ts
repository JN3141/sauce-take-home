import feedbackStore from "../store/feedback";
import sqsService from "../service/sqs";

/**
 * Creates a feedback entry and runs analysis on it.
 * @param text The feedback to create
 */
const createFeedback = async (text: string) => {
  const feedback = await feedbackStore.createFeedback(text);

  await sqsService.sendMessageToEventQueue({
    type: "FeedbackCreated",
    payload: {
      feedback: feedback,
    },
  });

  return feedback;
};

/**
 * Gets a feedback entry by its id
 * @param id The id of the feedback
 */
const getFeedback = async (id: number | bigint) => {
  return feedbackStore.getFeedback(id);
};

/**
 * Gets a page of feedback entries
 * @param page The page number
 * @param perPage The number of entries per page
 */
const getFeedbackPage = async (first: number, after?: number) => {
  return await feedbackStore.getFeedbackPage(first, after);
};

export default {
  createFeedback,
  getFeedback,
  getFeedbackPage,
};
