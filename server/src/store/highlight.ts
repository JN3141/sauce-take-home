import db from "./db";
import { Highlight } from "./model";

export type CreateHighlightArgs = {
  feedbackId: number | bigint;
  highlightSummary: string;
  highlightQuote: string;
};

/**
 * Creates a new highlight entry
 * @param args The arguments to create a highlight
 */
const createHighlight = async (
  args: CreateHighlightArgs
): Promise<Highlight> => {
  const result = db
    .prepare(
      /* sql */ `INSERT INTO Highlight (quote, summary, feedbackId)
                 VALUES (?, ?, ?)`
    )
    .run(args.highlightSummary, args.highlightQuote, args.feedbackId);

  return {
    id: result.lastInsertRowid,
    feedbackId: args.feedbackId,
    summary: args.highlightSummary,
    quote: args.highlightQuote,
  };
};

/**
 * Creates highlight entry
 * @param text The text of the highlight
 */
const createHighlights = async (
  highlights: CreateHighlightArgs[]
): Promise<Highlight[]> => {
  const savedHighlights: Highlight[] = [];
  const insertMultipleHighlights = db.transaction(
    async (highlights: CreateHighlightArgs[]) => {
      for (const highlight of highlights) {
        savedHighlights.push(await createHighlight(highlight));
      }
    }
  );

  await insertMultipleHighlights(highlights);

  return savedHighlights;
};

/**
 * Gets a highlight entry by its id
 * @param id The id of the highlight
 */
const getHighlight = async (id: number | bigint) => {
  return db
    .prepare(
      /* sql */ `SELECT *
                 FROM Highlight
                 WHERE id = ?`
    )
    .get(id) as Highlight;
};

/**
 * Gets a page of highlight entries
 * @param page The page number
 * @param perPage The number of entries per page
 */
const getHighlightPage = async (page: number, perPage: number) => {
  return db
    .prepare(
      /* sql */ `SELECT *
                 FROM Highlight
                 ORDER BY id DESC
                 LIMIT ? OFFSET ?`
    )
    .all(perPage, (page - 1) * perPage);
};

/**
 * Gets the highlights of a feedback entry
 * @param feedbackId The id of the feedback
 */
const getFeedbackHighlights = async (feedbackId: number | bigint) => {
  return db
    .prepare(
      /* sql */ `SELECT *
                 FROM Highlight
                 WHERE feedbackId = ?`
    )
    .all(feedbackId);
};

export default {
  getFeedbackHighlights,
  getHighlight,
  getHighlightPage,
  createHighlight,
  createHighlights,
};
