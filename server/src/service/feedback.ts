import feedbackStore from "../store/feedback";
import highlightService from "../service/highlight";
import prompt from "../ai/prompt";

/**
 * Creates a feedback entry and runs analysis on it.
 * @param text The feedback to create
 */
const createFeedback = async (text: string) => {
  const feedback = await feedbackStore.createFeedback(text);
  // TODO: remove this hack to actually run the analysis; just for local dev-ing
  // const analysisResult = await prompt.runFeedbackAnalysis(feedback.text);
  const analysisResult = {
    highlights: [
      {
        summary: "Merge Option RequestA",
        quote:
          "A request for a 'merge' option to combine related issues, suggesting that merging can consolidate related feedback sourced from the same communication.",
      },
      {
        summary: "Merge Option RequestB",
        quote:
          "A request for a 'merge' option to combine related issues, suggesting that merging can consolidate related feedback sourced from the same communication.",
      },
    ],
  };

  await highlightService.createHighlights(
    analysisResult.highlights.map((rawHighlight) => ({
      highlightQuote: rawHighlight.quote,
      highlightSummary: rawHighlight.summary,
      feedbackId: feedback.id,
    }))
  );

  return feedback;
};

/**
 * Gets a feedback entry by its id
 * @param id The id of the feedback
 */
const getFeedback = async (id: number) => {
  return feedbackStore.getFeedback(id);
}

/**
 * Gets a page of feedback entries
 * @param page The page number
 * @param perPage The number of entries per page
 */
const getFeedbackPage = async (page: number, perPage: number) => {
  const values = await feedbackStore.getFeedbackPage(page, perPage);
  const count = values.length;
  return { values, count };
};

export default {
  createFeedback,
  getFeedback,
  getFeedbackPage,
}
