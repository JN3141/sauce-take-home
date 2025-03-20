import {z} from "zod";

export const highlightPromptResultSchema = z.object({
  highlights: z.array(z.object({
    summary: z.string(),
    quote: z.string(),
  }))
})

export type HighlightPromptResult = z.infer<typeof highlightPromptResultSchema>;
