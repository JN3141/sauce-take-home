import { usePaginationFragment } from "react-relay";
import { graphql } from "relay-runtime";

import { FeedbackItems$key } from "./__generated__/FeedbackItems.graphql";
import FeedbackItem from "./FeedbackItem";

type Props = {
  queryRef: FeedbackItems$key;
};

export const DEFAULT_PAGE_SIZE = 5;

const FeedbackItems = ({ queryRef }: Props) => {
  const { data, loadNext, hasNext } = usePaginationFragment(
    graphql`
      fragment FeedbackItems on Query
      @argumentDefinitions(first: { type: "Int" }, after: { type: "String" })
      @refetchable(queryName: "FeedbackItemsPaginationQuery") {
        feedbacks(first: $first, after: $after, sort: { field: "id", direction: DESC })
          @connection(key: "FeedbackItems_feedbacks") {
          edges {
            node {
              ...FeedbackItem
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    `,
    queryRef
  );

  if (!data.feedbacks?.edges) {
    return null;
  }

  return (
    <>
      {data.feedbacks.edges.map((feedback) =>
        feedback.node ? <FeedbackItem queryRef={feedback.node} /> : null
      )}
      {hasNext && (
        <button
          onClick={() => loadNext(DEFAULT_PAGE_SIZE)}
          className="w-full bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-lg py-2 px-4 "
        >
          Load More
        </button>
      )}
    </>
  );
};

export default FeedbackItems;
