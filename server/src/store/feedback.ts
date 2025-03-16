import db from "./db";

/**
 * Gets a feedback entry by its id
 * @param id The id of the feedback
 */
const getFeedback = async (id: number) => {
  return db.prepare(`SELECT *
                     FROM Feedback
                     WHERE id = ?`).get(id)
}

/**
 * Gets a page of feedback entries
 * @param page The page number
 * @param perPage The number of entries per page
 */
const getFeedbackPage = async (page: number, perPage: number) => {
  return db.prepare(`SELECT *
                     FROM Feedback
                     ORDER BY id DESC
                     LIMIT ? OFFSET ?`).all(perPage, (page - 1) * perPage)
}

/**
 * Counts the number of feedback entries
 * @returns The number of feedback entries
 */

const countFeedback = (): number => {
  const stmt = db.prepare(`SELECT COUNT(*) as count
                          FROM Feedback`);
  
  const result = stmt.get() as { count: number };
  return result.count;
}

/**
 * Creates a new feedback entry
 * @param text The text of the feedback
 */
const createFeedback = async (text: string) => {
  const result = db.prepare(`INSERT INTO Feedback (text)
                             VALUES (?)`).run(text);
  return {id: result.lastInsertRowid, text}
}

export default {getFeedback, getFeedbackPage, createFeedback};
