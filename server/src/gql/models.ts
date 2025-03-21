import { fromGlobalId, toGlobalId } from "graphql-relay";
import { z } from "zod";

export type GraphQLNode = { id: string };

const sauceGraphQLTypeSchema = z.enum(["Feedback", "Highlight"]);

export type SauceGraphQLType = z.infer<typeof sauceGraphQLTypeSchema>;

const sauceGraphQLGlobalIdArgsSchema = z.object({
  type: sauceGraphQLTypeSchema,
  id: z.preprocess(
    (maybeNumberOrBigInt) => parseInt(maybeNumberOrBigInt as string, 10),
    z.number().positive().or(z.bigint().positive())
  ),
});

export const sauceFromGlobalIdOrThrow = (
  globalId: string,
  expectedType: SauceGraphQLType
) => {
  const maybeSauceGlobalId = fromGlobalId(globalId);
  const validatedSauceGlobalId =
    sauceGraphQLGlobalIdArgsSchema.parse(maybeSauceGlobalId);

  z.literal(validatedSauceGlobalId.type).parse(expectedType);

  return validatedSauceGlobalId;
};

export const sauceToGlobalId = (type: SauceGraphQLType, id: number | bigint) =>
  toGlobalId(type, id as number);
