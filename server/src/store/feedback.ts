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
 * @param first the number of entries to return
 * @param cursor the id following which to start fetching
 * @param isAsc whether to sort in ascending order or not
 */
const getFeedbackPage = async (
  first: number,
  isAsc: boolean,
  cursor?: number | bigint,
) => {
  const dbPreparedStatement = isAsc
    ? db.prepare(/* sql */ `SELECT *
               FROM Feedback
               WHERE (?) IS NULL OR id > (?)
               ORDER BY id ASC
               LIMIT (?)`)
    : db.prepare(/* sql */ `SELECT *
                 FROM Feedback
                 WHERE (?) IS NULL OR id < (?)
                 ORDER BY id DESC
                 LIMIT (?)`);

  return dbPreparedStatement.all(cursor, cursor, first) as Feedback[];
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
