import feedbackStore from "../store/feedback";
import sqsService from "../service/sqs";
import { Feedback } from "../store/model";
import db from "../store/db";

/**
 * Creates a feedback entry and runs analysis on it asynchronously.
 * @param text The feedback to create
 */
const createFeedback = async (text: string) => {
  let feedback: Feedback | undefined;
  const insertFeedback = db.transaction(async (text: string) => {
    feedback = await feedbackStore.createFeedback(text);
    // Send event to SQS during the transaction, so if it fails to send to SQS, the transaction will be rolled back
    await sqsService.sendMessageToEventQueue({
      type: "FeedbackCreated",
      payload: {
        feedback,
      },
    });
  });

  await insertFeedback(text);

  if (!feedback) {
    throw new Error("Failed to create feedback");
  }

  return feedback;
};

/**
 * Creates feedback entries and runs analyses on them asynchronously.
 * @param texts The feedback texts to create
 */
const createFeedbacks = async (texts: string[]) => {
  const savedFeedbacks: Feedback[] = [];
  const insertMultipleFeedbacks = db.transaction(async (texts: string[]) => {
    for (const text of texts) {
      savedFeedbacks.push(await feedbackStore.createFeedback(text));
    }

    // Send event to SQS during the transaction, so if it fails to send to SQS, the transaction will be rolled back
    await sqsService.sendMessageToEventQueue({
      type: "BulkFeedbackCreated",
      payload: {
        feedbacks: savedFeedbacks,
      },
    });
  });

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
const getFeedbackPage = async (first: number, after?: number | bigint) => {
  return await feedbackStore.getFeedbackPage(first, after);
};

export default {
  createFeedback,
  createFeedbacks,
  getFeedback,
  getFeedbackPage,
};
