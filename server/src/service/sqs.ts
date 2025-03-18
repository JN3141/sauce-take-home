import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { fromEnv } from "@aws-sdk/credential-providers";
import { Feedback } from "../store/model";

export const EVENT_QUEUE_URL = process.env.EVENT_QUEUE_URL ?? "";

if (!EVENT_QUEUE_URL) {
  throw new Error("Missing EVENT_QUEUE_URL environment variable");
}

const sqsClient = new SQSClient({
  credentials: fromEnv(),
  region: process.env.AWS_REGION,
});

export const eventBusMessageTypes = ["FeedbackCreated"];
export type EventBusMessageType = (typeof eventBusMessageTypes)[number];

export type EventBusMessage = {
  type: EventBusMessageType;
  payload: unknown;
};

type FeedbackCreatedMessage = {
  type: "FeedbackCreated";
  payload: {
    feedback: Feedback;
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
    eventBusMessageTypes.includes(maybeMessage.type)
  );
};

const isFeedbackCreatedMessage = (
  maybeFeedbackCreatedMessage: unknown
): maybeFeedbackCreatedMessage is FeedbackCreatedMessage => {
  return (
    isEventBusMessage(maybeFeedbackCreatedMessage) &&
    maybeFeedbackCreatedMessage.type === "FeedbackCreated" &&
    "payload" in maybeFeedbackCreatedMessage &&
    typeof maybeFeedbackCreatedMessage.payload === "object" &&
    maybeFeedbackCreatedMessage.payload !== null &&
    "feedback" in maybeFeedbackCreatedMessage.payload &&
    typeof maybeFeedbackCreatedMessage.payload.feedback === "object" &&
    maybeFeedbackCreatedMessage.payload.feedback !== null &&
    "id" in maybeFeedbackCreatedMessage.payload.feedback &&
    typeof maybeFeedbackCreatedMessage.payload.feedback.id === "number" &&
    "text" in maybeFeedbackCreatedMessage.payload.feedback &&
    typeof maybeFeedbackCreatedMessage.payload.feedback.text === "string"
  );
};

const sendMessage = async (queueUrl: string, message: EventBusMessage) => {
  const params = {
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(message),
  };

  return await sqsClient.send(new SendMessageCommand(params));
};

const sendMessageToEventQueue = async (message: EventBusMessage) => {
  await sendMessage(EVENT_QUEUE_URL, message);
};

export default {
  isEventBusMessage,
  isFeedbackCreatedMessage,
  sendMessageToEventQueue,
};
