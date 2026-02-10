import { z } from "zod";

// Schema for query parameters
export const queryCandidatesSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10),
	isQualified: z
		.enum(["true", "false"])
		.optional()
		.transform((val) =>
			val === "true" ? true : val === "false" ? false : undefined,
		),
	evaluated: z
		.enum(["true", "false"])
		.optional()
		.transform((val) =>
			val === "true" ? true : val === "false" ? false : undefined,
		),
	minScore: z.coerce.number().int().min(0).max(100).optional(),
	sortBy: z
		.enum(["createdAt", "matchScore", "age", "evaluatedAt"])
		.default("createdAt"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Types
export type QueryCandidatesInput = z.infer<typeof queryCandidatesSchema>;
