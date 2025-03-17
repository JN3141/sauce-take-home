import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { FeedbackItem$key } from "./__generated__/FeedbackItem.graphql";
import { useState } from "react";

type Props = {
  queryRef: FeedbackItem$key;
};

const FeedbackItem = ({ queryRef }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const data = useFragment(
    graphql`
      fragment FeedbackItem on Feedback {
        id
        text
        highlights {
          id
          quote
          summary
        }
      }
    `,
    queryRef
  );

  return (
    <div>
      <button
        key={data?.id}
        className="bg-slate-700 bg-opacity-20 hover:bg-opacity-30 cursor-pointer rounded-lg py-2 px-4 text-left"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-col">
          <div className="flex flex-row items-center">
            <p className="text-red-300">{data.text}</p>
            <div className="pl-4">
              <div className={isExpanded ? "rotate-180" : ""}>^</div>
            </div>
          </div>
          {/* TODO: add an animation here for the open / close */}
          {isExpanded &&
            data.highlights &&
            data.highlights.map((highlight) => {
              return (
                <div key={highlight.id} className="pt-2 pl-4 text-left">
                  <p className="text-red-300">
                    <i>{highlight.summary}</i> - {highlight.quote}
                  </p>
                </div>
              );
            })}
        </div>
      </button>
    </div>
  );
};

export default FeedbackItem;
