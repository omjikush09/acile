import {
	Router,
	type Request,
	type Response,
	type NextFunction,
} from "express";
import { queryCandidatesSchema } from "../schemas/candidate.schema";
import * as candidateService from "../services/candidate.service";
import { ZodError, type ZodIssue } from "zod";

const router = Router();

// Validation middleware helper
function validate<T>(
	schema: { parse: (data: unknown) => T },
	source: "body" | "query" = "body",
) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const data = source === "body" ? req.body : req.query;
			const validated = schema.parse(data);
			if (source === "body") {
				req.body = validated;
			} else {
				(req as any).validatedQuery = validated;
			}
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				const issues = error.issues as ZodIssue[];
				res.status(400).json({
					success: false,
					error: "Validation failed",
					details: issues.map((e: ZodIssue) => ({
						path: e.path.join("."),
						message: e.message,
					})),
				});
				return;
			}
			next(error);
		}
	};
}

/**
 * @route   GET /api/candidates
 * @desc    Get all candidates with pagination and filtering
 */
router.get(
	"/",
	validate(queryCandidatesSchema, "query"),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const query = (req as any).validatedQuery;
			const result = await candidateService.getCandidates(query);
			res.json({
				success: true,
				...result,
			});
		} catch (error) {
			next(error);
		}
	},
);

export default router;
