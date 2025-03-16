export type Feedback = {
  id: number | bigint;
  text: string;
}

export type Highlight = {
  id: number | bigint;
  feedbackId: number | bigint;
  summary: string;
  quote: string;
}
