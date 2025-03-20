import feedbackStore from "../store/feedback";
import sqsService from "../service/sqs";
import { Feedback } from "../store/model";
import db from "../store/db";

/**
 * Creates a feedback entry and runs analysis on it asynchronously.
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
 * Creates feedback entries and runs analyses on them asynchronously.
 * @param texts The feedback texts to create
 */
const createFeedbacks = async (texts: string[]) => {
  const savedFeedbacks: Feedback[] = [];
  const insertMultipleFeedbacks = db.transaction(
    async (texts: string[]) => {
      for (const text of texts) {
        savedFeedbacks.push(await feedbackStore.createFeedback(text));
      }

      for (const feedback of savedFeedbacks) {
        await sqsService.sendMessageToEventQueue({
          type: "FeedbackCreated",
          payload: {
            feedback: feedback,
          },
        });
      }
    }
  );

  await insertMultipleFeedbacks(texts);

  return savedFeedbacks;
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
  createFeedbacks,
  getFeedback,
  getFeedbackPage,
};
