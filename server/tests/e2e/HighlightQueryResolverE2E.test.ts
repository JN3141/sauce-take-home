import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, Mock, vi } from "vitest";
import "../../src/main";
import feedbackService from "../../src/service/feedback";
import { getOpenAIClient } from "../../src/ai/client";

vi.mock("../../src/ai/client", () => ({
  getOpenAIClient: vi.fn(),
}));

const mockGetOpenAIClient = getOpenAIClient as Mock;

describe("HighightQueryResolverE2E", () => {
  const testQueryString = /* GraphQL */ `
    query TestQueryString($first: Int, $after: String) {
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

  beforeAll(async () => {
    await feedbackService.createFeedback("feedback A");
    await feedbackService.createFeedback("feedback B");
    await feedbackService.createFeedback("feedback C");
  });

  beforeEach(() => {
    mockGetOpenAIClient.mockImplementation(() => ({
      chat: {
        completions: {
          create: () => Promise.resolve({
            choices: [
              {message: {
                content: JSON.stringify({
                  data: {
                    highlights: [
                      {
                        quote: "Highlight quote",
                        summary: "Highlight summary",
                      },
                    ],
                  }
                }),
              }}
            ]
          }),
        }
      }
    })
  );
});

  it("should return created highlights", async () => {
    const response = await request("http://localhost:4000")
      .post("/graphql")
      .send({
        query: testQueryString,
        variables: { first: 2 },
      });

    expect(response.body.data?.feedbacks?.edges).toHaveLength(2);
    expect(response.body.data?.feedbacks?.edges[0].node?.text).toBe(
      "feedback A"
    );
    expect(response.body.data?.feedbacks?.edges[1].node?.text).toBe(
      "feedback B"
    );

    expect(response.body.data?.feedbacks?.pageInfo?.hasNextPage).toBe(true);

    expect(response.body.data?.feedbacks?.pageInfo?.endCursor).toBe(
      response.body.data?.feedbacks?.edges[1].cursor
    );
    expect(response.body.data?.feedbacks?.pageInfo?.endCursor).toBe(
      response.body.data?.feedbacks?.edges[1].node.id
    );
  });

  it("should paginate highlights correctly", async () => {
    const responseA = await request("http://localhost:4000")
      .post("/graphql")
      .send({
        query: testQueryString,
        variables: { first: 2 },
      });

    const responseB = await request("http://localhost:4000")
    .post("/graphql")
    .send({
      query: testQueryString,
      variables: { first: 2, after: responseA.body.data?.feedbacks?.pageInfo?.endCursor },
    });

    expect(responseB.body.data?.feedbacks?.edges).toHaveLength(1);
    expect(responseB.body.data?.feedbacks?.edges[0].node?.text).toBe(
      "feedback C"
    );
    expect(responseB.body.data?.feedbacks?.pageInfo?.hasNextPage).toBe(false);

    expect(responseB.body.data?.feedbacks?.pageInfo?.endCursor).toBe(
      responseB.body.data?.feedbacks?.edges[0].cursor
    );
    expect(responseB.body.data?.feedbacks?.pageInfo?.endCursor).toBe(
      responseB.body.data?.feedbacks?.edges[0].node.id
    );
  });
});
