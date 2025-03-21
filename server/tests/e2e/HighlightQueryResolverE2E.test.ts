import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import "../../src/main";
import feedbackService from "../../src/service/feedback";
import { getOpenAIClient } from "../../src/ai/client";
import db from "../../src/store/db";
import { createYoga } from "graphql-yoga";
import { schema } from "../../src/gql/schema";
import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { parse } from "graphql";
import { sauceFromGlobalIdOrThrow } from "../../src/gql/models";

function assertSingleValue<TValue extends object>(
  value: TValue | AsyncIterable<TValue>
): asserts value is TValue {
  if (Symbol.asyncIterator in value) {
    throw new Error("Expected single value");
  }
}

vi.mock("../../src/ai/client", () => ({
  getOpenAIClient: vi.fn(),
}));

const mockGetOpenAIClient = getOpenAIClient as Mock;

describe("HighightQueryResolverE2E", () => {
  const yoga = createYoga({ schema });
  const executor = buildHTTPExecutor({
    fetch: yoga.fetch,
  });

  const mockHighlights = [
    {
      quote: "Highlight quote A",
      summary: "Highlight summary A",
    },
    {
      quote: "Highlight quote B",
      summary: "Highlight summary B",
    },
  ];

  beforeEach(() => {
    db.exec("DELETE FROM Highlight;");
    db.exec("DELETE FROM Feedback;");

    mockGetOpenAIClient.mockImplementation(() => ({
      chat: {
        completions: {
          create: () =>
            Promise.resolve({
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      highlights: mockHighlights,
                    }),
                  },
                },
              ],
            }),
        },
      },
    }));
  });

  const pollForHighlights = async (feedbackId: string) => {
    const response = await executor({
      document: parse(/* GraphQL */ `
        query Feedback($id: ID!) {
          feedback(id: $id) {
            id
            text
            highlights {
              id
              quote
              summary
            }
          }
        }
      `),
      variables: { id: feedbackId },
    });

    assertSingleValue(response);

    return response.data.feedback.highlights;
  };

  const isMockHighlights = (highlights: any[]) =>
    highlights.length === 2 &&
    highlights[0].quote === "Highlight quote A" &&
    highlights[0].summary === "Highlight summary A" &&
    highlights[1].quote === "Highlight quote B" &&
    highlights[1].summary === "Highlight summary B";

  it("should create a new feedback entry with async highlights", async () => {
    const testFeedback = "Test feedback";

    const createResponse = await executor({
      document: parse(/* GraphQL */ `
        mutation CreateFeedback($text: String!) {
          createFeedback(text: $text) {
            id
            text
          }
        }
      `),
      variables: { text: testFeedback },
    });

    assertSingleValue(createResponse);

    sauceFromGlobalIdOrThrow(createResponse.data.createFeedback.id, "Feedback");

    expect(createResponse.data.createFeedback.text).toBe(testFeedback);

    await expect
      .poll(async () =>
        pollForHighlights(createResponse.data.createFeedback.id)
      )
      .toSatisfy(isMockHighlights);
  });

  it("should bulk create new feedback entries with async highlights", async () => {
    const createResponse = await executor({
      document: parse(/* GraphQL */ `
        mutation CreateFeedbacks($texts: [String!]!) {
          createFeedbacks(texts: $texts) {
            id
            text
            highlights {
              id
              quote
              summary
            }
          }
        }
      `),
      variables: { texts: ["Test feedback A", "Test feedback B"] },
    });

    assertSingleValue(createResponse);

    sauceFromGlobalIdOrThrow(createResponse.data.createFeedbacks[0].id, "Feedback");
    expect(createResponse.data.createFeedbacks[0].text).toBe("Test feedback A");

    sauceFromGlobalIdOrThrow(createResponse.data.createFeedbacks[1].id, "Feedback");
    expect(createResponse.data.createFeedbacks[1].text).toBe("Test feedback B");

    await expect
      .poll(async () =>
        pollForHighlights(createResponse.data.createFeedbacks[0].id)
      )
      .toSatisfy(isMockHighlights);

    await expect
      .poll(async () =>
        pollForHighlights(createResponse.data.createFeedbacks[1].id)
      )
      .toSatisfy(isMockHighlights);
  });

  it("should return highlights correctly, with pagination", async () => {
    const testQueryString = /* GraphQL */ `
      query Feedbacks($first: Int, $after: String) {
        feedbacks(first: $first, after: $after) {
          edges {
            node {
              id
              text
              highlights {
                id
                quote
                summary
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    await feedbackService.createFeedback("feedback A");
    await feedbackService.createFeedback("feedback B");
    await feedbackService.createFeedback("feedback C");

    const responseA = await executor({
      document: parse(testQueryString),
      variables: { first: 2 },
    });

    assertSingleValue(responseA);

    expect(responseA.data?.feedbacks?.edges).toHaveLength(2);
    expect(responseA.data?.feedbacks?.edges[0].node?.text).toBe("feedback A");
    expect(responseA.data?.feedbacks?.edges[1].node?.text).toBe("feedback B");

    expect(responseA.data?.feedbacks?.pageInfo?.hasNextPage).toBe(true);
    expect(responseA.data?.feedbacks?.pageInfo?.endCursor).toBe(
      responseA.data?.feedbacks?.edges[1].cursor
    );
    expect(responseA.data?.feedbacks?.pageInfo?.endCursor).toBe(
      responseA.data?.feedbacks?.edges[1].node.id
    );

    const responseB = await executor({
      document: parse(testQueryString),
      variables: {
        first: 2,
        after: responseA.data?.feedbacks?.pageInfo?.endCursor,
      },
    });

    assertSingleValue(responseB);

    expect(responseB.data?.feedbacks?.edges).toHaveLength(1);
    expect(responseB.data?.feedbacks?.edges[0].node?.text).toBe("feedback C");

    expect(responseB.data?.feedbacks?.pageInfo?.hasNextPage).toBe(false);
    expect(responseB.data?.feedbacks?.pageInfo?.endCursor).toBe(
      responseB.data?.feedbacks?.edges[0].cursor
    );
    expect(responseB.data?.feedbacks?.pageInfo?.endCursor).toBe(
      responseB.data?.feedbacks?.edges[0].node.id
    );
  });
});
