export type Feedback = {
  id: number | bigint;
  text: string;
}

export const isFeedback = (maybeFeedback: unknown): maybeFeedback is Feedback => {
  return (
    typeof maybeFeedback === "object" &&
    maybeFeedback !== null &&
    "id" in maybeFeedback &&
    typeof maybeFeedback.id === "number" &&
    "text" in maybeFeedback &&
    typeof maybeFeedback.text === "string"
  );
}

export type Highlight = {
  id: number | bigint;
  feedbackId: number | bigint;
  summary: string;
  quote: string;
}
