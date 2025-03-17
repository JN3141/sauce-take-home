import { graphql, useLazyLoadQuery } from "react-relay";
import { FeedbackListQuery } from "./__generated__/FeedbackListQuery.graphql";
import FeedbackItems, { DEFAULT_PAGE_SIZE } from "./FeedbackItems";

export default function FeedbackList() {
  const data = useLazyLoadQuery<FeedbackListQuery>(
    graphql`
      query FeedbackListQuery($first: Int, $after: String) {
        ...FeedbackItems @arguments(first: $first, after: $after)
      }
    `,
    { first: DEFAULT_PAGE_SIZE },
  );

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Feedback</h1>
      <FeedbackItems queryRef={data} />
    </div>
  );
}
