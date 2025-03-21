import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { fromEnv } from "@aws-sdk/credential-providers";
import { Feedback, isFeedback } from "../store/model";

export const EVENT_QUEUE_URL = process.env.EVENT_QUEUE_URL ?? "";

const getSqsClient = () => {
  if (!EVENT_QUEUE_URL) {
    throw new Error("Missing EVENT_QUEUE_URL environment variable");
  }

  return new SQSClient({
    credentials: fromEnv(),
    region: process.env.AWS_REGION,
  });
};

export const eventBusMessageTypes = ["BulkFeedbackCreated", "FeedbackCreated"];
export type EventBusMessageType = (typeof eventBusMessageTypes)[number];

export type EventBusMessage = FeedbackCreatedMessage | BulkFeedbackCreatedMessage;

type FeedbackCreatedMessage = {
  type: "FeedbackCreated";
  payload: {
    feedback: Feedback;
  };
};

type BulkFeedbackCreatedMessage = {
  type: "BulkFeedbackCreated";
  payload: {
    feedbacks: Feedback[];
  };
};

const isEventBusMessage = (
  maybeMessage: unknown
): maybeMessage is EventBusMessage => {
  return (
    typeof maybeMessage === "object" &&
    maybeMessage !== null &&
    "type" in maybeMessage &&
    typeof maybeMessage.type === "string" &&
    eventBusMessageTypes.includes(maybeMessage.type) &&
    "payload" in maybeMessage &&
    typeof maybeMessage.payload === "object" &&
    maybeMessage.payload !== null
  );
};

const isFeedbackCreatedMessage = (
  maybeFeedbackCreatedMessage: unknown
): maybeFeedbackCreatedMessage is FeedbackCreatedMessage => {
  return (
    isEventBusMessage(maybeFeedbackCreatedMessage) &&
    maybeFeedbackCreatedMessage.type === "FeedbackCreated" &&
    "feedback" in maybeFeedbackCreatedMessage.payload &&
    isFeedback(maybeFeedbackCreatedMessage.payload.feedback)
  );
};

const isBulkFeedbackCreatedMessage = (
  maybeBulkFeedbackCreatedMessage: unknown
): maybeBulkFeedbackCreatedMessage is BulkFeedbackCreatedMessage => {
  return (
    isEventBusMessage(maybeBulkFeedbackCreatedMessage) &&
    maybeBulkFeedbackCreatedMessage.type === "BulkFeedbackCreated" &&
    "feedbacks" in maybeBulkFeedbackCreatedMessage.payload &&
    Array.isArray(maybeBulkFeedbackCreatedMessage.payload.feedbacks) &&
    maybeBulkFeedbackCreatedMessage.payload.feedbacks.every((feedback) =>
      isFeedback(feedback)
    )
  );
};

const sendMessage = async (queueUrl: string, message: EventBusMessage) => {
  const params = {
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(message),
  };

  return await getSqsClient().send(new SendMessageCommand(params));
};

const sendMessageToEventQueue = async (message: EventBusMessage) => {
  await sendMessage(EVENT_QUEUE_URL, message);
};

export default {
  isBulkFeedbackCreatedMessage,
  isEventBusMessage,
  isFeedbackCreatedMessage,
  sendMessageToEventQueue,
};
