import { Consumer } from "sqs-consumer";
import highlightService from "./service/highlight";
import sqsService, { EVENT_QUEUE_URL } from "./service/sqs";
import prompt from "./ai/prompt";

console.info("Event queue consumer is running");

const eventQueueConsumer = Consumer.create({
  queueUrl: EVENT_QUEUE_URL,
  handleMessage: async (message) => {
    if (!message.Body) {
      throw new Error("Received event queue message without body");
    }

    const maybeEventBusMessage = JSON.parse(message.Body);
    if (!sqsService.isEventBusMessage(maybeEventBusMessage)) {
      throw new Error(
        "Received event queue message that is not an event bus message"
      );
    }

    if (sqsService.isFeedbackCreatedMessage(maybeEventBusMessage)) {
      console.log(
        "Feedback created event received:",
        maybeEventBusMessage.payload
      );

      const feedback = maybeEventBusMessage.payload.feedback;

      // TODO: put this into highlight service
      // TODO: remove this hack to actually run the analysis; just for local dev-ing
      // const analysisResult = await prompt.runFeedbackAnalysis(feedback.text);
      const analysisResult = {
        highlights: [
          {
            summary: "Merge Option RequestA",
            quote:
              "A request for a 'merge' option to combine related issues, suggesting that merging can consolidate related feedback sourced from the same communication.",
          },
          {
            summary: "Merge Option RequestB",
            quote:
              "A request for a 'merge' option to combine related issues, suggesting that merging can consolidate related feedback sourced from the same communication.",
          },
        ],
      };

      await highlightService.createHighlights(
        analysisResult.highlights.map((rawHighlight) => ({
          highlightQuote: rawHighlight.quote,
          highlightSummary: rawHighlight.summary,
          feedbackId: feedback.id,
        }))
      );
    } else {
      throw new Error("Received event queue message with unknown type");
    }
  },
});

eventQueueConsumer.start();
