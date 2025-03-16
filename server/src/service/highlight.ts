import highlightStore, { CreateHighlightArgs } from "../store/highlight";

const createHighlights = async (highlights: CreateHighlightArgs[]) => {
  return await highlightStore.createHighlights(highlights);
}

/**
 * Gets the highlights of a feedback entry
 * @param feedbackId The id of the feedback
 */
const getFeedbackHighlights = async (feedbackId: number | bigint) =>
  highlightStore.getFeedbackHighlights(feedbackId);

export default {
  createHighlights,
  getFeedbackHighlights,
}
