import { usePaginationFragment } from "react-relay";
import { graphql } from "relay-runtime";

import { FeedbackItems$key } from "./__generated__/FeedbackItems.graphql";

type Props = {
  queryRef: FeedbackItems$key;
};

export const DEFAULT_PAGE_SIZE = 5;

// TODO: make this reverse sort, so that you see the latest feedback first
const FeedbackItems = ({ queryRef }: Props) => {
  const { data, loadNext, hasNext } = usePaginationFragment(
    graphql`
      fragment FeedbackItems on Query
      @argumentDefinitions(
        first: { type: "Int" }
        after: { type: "String" }
      )
      @refetchable(queryName: "FeedbackItemsPaginationQuery") {
        feedbacks(first: $first, after: $after)
          @connection(key: "FeedbackItems_feedbacks") {
          edges {
            node {
              id
              text
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
      {data.feedbacks.edges.map((feedback) => (
        <button
          key={feedback.node?.id}
          className="bg-slate-700 bg-opacity-20 hover:bg-opacity-30 cursor-pointer rounded-lg py-2 px-4 text-left"
        >
          <p className="text-red-300">{feedback.node?.text}</p>
        </button>
      ))}
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
