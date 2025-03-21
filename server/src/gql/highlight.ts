import highlightService from "../service/highlight";
import { GraphQLNode, sauceFromGlobalIdOrThrow, sauceToGlobalId } from "./models";

const getFeedbackHighlights = async (parent: GraphQLNode) => {
  const parentDbId = sauceFromGlobalIdOrThrow(parent.id, "Feedback");
  const feedbackHighlights = await highlightService.getFeedbackHighlights(parentDbId.id);
  return feedbackHighlights.map((highlight) => ({
    ...highlight,
    id: sauceToGlobalId("Highlight", highlight.id),
  }));
};

export default {
  getFeedbackHighlights,
};
