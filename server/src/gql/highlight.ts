import highlightService from "../service/highlight";
import { GraphQLNode, sauceFromGlobalId, sauceToGlobalId } from "./utils";

const getFeedbackHighlights = async (parent: GraphQLNode) => {
  const parentDbId = sauceFromGlobalId(parent.id)
  const feedbackHighlights = await highlightService.getFeedbackHighlights(parentDbId.id);
  return feedbackHighlights.map((highlight) => ({
    ...highlight,
    id: sauceToGlobalId("Highlight", highlight.id),
  }));
};

export default {
  getFeedbackHighlights,
};
