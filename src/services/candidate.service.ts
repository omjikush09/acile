import prisma from "../lib/prisma";
import type { QueryCandidatesInput } from "../schemas/candidate.schema";

export async function getCandidates(query: QueryCandidatesInput) {
	const { page, limit, isQualified, evaluated, minScore, sortBy, sortOrder } =
		query;
	const skip = (page - 1) * limit;

	const where: any = {};

	if (isQualified !== undefined) {
		where.isQualified = isQualified;
	}

	if (evaluated !== undefined) {
		if (evaluated) {
			where.evaluatedAt = { not: null };
		} else {
			where.evaluatedAt = null;
		}
	}

	if (minScore !== undefined) {
		where.matchScore = { gte: minScore };
	}

	const [candidates, total] = await Promise.all([
		prisma.candidate.findMany({
			where,
			skip,
			take: limit,
			orderBy: { [sortBy]: sortOrder },
		}),
		prisma.candidate.count({ where }),
	]);

	return {
		data: candidates,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
			hasNext: page * limit < total,
			hasPrev: page > 1,
		},
	};
}
