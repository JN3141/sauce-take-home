import db from "./db";
import { Feedback } from "./model";

/**
 * Gets a feedback entry by its id
 * @param id The id of the feedback
 */
const getFeedback = async (id: number | bigint) => {
  return db
    .prepare(
      /* sql */ `SELECT *
                 FROM Feedback
                 WHERE id = ?`
    )
    .get(id) as Feedback;
};

/**
 * Gets a page of feedback entries
 * @param page The page number
 * @param perPage The number of entries per page
 */
const getFeedbackPage = async (first: number, after?: number) => {
  return db
    .prepare(
      /* sql */ `SELECT *
                 FROM Feedback
                 WHERE (?) IS NULL OR id > (?)
                 ORDER BY id ASC
                 LIMIT (?)`
    )
    .all(after, after, first) as Feedback[];
};

/**
 * Counts the number of feedback entries
 * @returns The number of feedback entries
 */

const countFeedback = (): number => {
  const stmt = db.prepare(`SELECT COUNT(*) as count
                          FROM Feedback`);

  const result = stmt.get() as { count: number };
  return result.count;
};

/**
 * Creates a new feedback entry
 * @param text The text of the feedback
 */
const createFeedback = async (text: string) => {
  const result = db
    .prepare(
      /* sql */ `INSERT INTO Feedback (text)
                 VALUES (?)`
    )
    .run(text);
  return { id: result.lastInsertRowid, text };
};

export default { getFeedback, getFeedbackPage, createFeedback };
