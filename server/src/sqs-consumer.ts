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

      const analysisResult = await prompt.runFeedbackAnalysis(feedback.text);

      await highlightService.createHighlights(
        analysisResult.highlights.map((rawHighlight) => ({
          highlightQuote: rawHighlight.quote,
          highlightSummary: rawHighlight.summary,
          feedbackId: feedback.id,
        }))
      );
    } else if (sqsService.isBulkFeedbackCreatedMessage(maybeEventBusMessage)) {
      console.log(
        "Bulk feedback created event received:",
        maybeEventBusMessage.payload
      );

      const feedbacks = maybeEventBusMessage.payload.feedbacks;

      const createHighlightArgs = (await Promise.all(
        feedbacks.map(async (feedback) => {
          const analysisResult = await prompt.runFeedbackAnalysis(feedback.text);
          return analysisResult.highlights.map((rawHighlight) => ({
            highlightQuote: rawHighlight.quote,
            highlightSummary: rawHighlight.summary,
            feedbackId: feedback.id,
          }));
        })
      )).flat();

      await highlightService.createHighlights(createHighlightArgs);
    } else {
      throw new Error("Received event queue message with unknown type");
    }
  },
});

eventQueueConsumer.start();
