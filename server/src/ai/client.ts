import OpenAI from "openai";

const getOpenAIClient = () =>
  new OpenAI.OpenAI({
    apiKey: process.env.OPENAI_SECRET,
  });

export { getOpenAIClient };
