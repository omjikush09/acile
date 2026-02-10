import { ToolLoopAgent, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import prisma from "../lib/prisma";
import { SYSTEM_PROMPT } from "../util/systemPrompt";

export const screeningAgent = new ToolLoopAgent({
	model: openai("gpt-4o-mini"),
	instructions: SYSTEM_PROMPT,

	tools: {
		/**
		 * Save a candidate's screening evaluation results to the database.
		 * The agent calls this after completing the interview conversation.
		 */
		saveCandidateEvaluation: tool({
			description:
				"Save the complete candidate screening evaluation to the database after the interview is finished. Call this tool once you have gathered all required information from the candidate and made a qualification decision.",
			inputSchema: z.object({
				firstName: z.string().describe("Candidate's first name"),
				lastName: z.string().describe("Candidate's last name"),
				email: z.string().email().describe("Candidate's email address"),
				phone: z.string().optional().describe("Candidate's phone number"),

				// Mandatory qualifications
				age: z.number().int().describe("Candidate's age"),
				hasValidDriversLicense: z
					.boolean()
					.describe("Whether candidate has a valid driver's license"),
				hasCleanDrivingRecord: z
					.boolean()
					.describe("Whether candidate has a clean driving record"),
				passesBackgroundScreening: z
					.boolean()
					.describe(
						"Whether candidate is comfortable with background screening",
					),
				passesDrugScreening: z
					.boolean()
					.describe("Whether candidate is comfortable with drug screening"),
				canLiftUpTo150Lbs: z
					.boolean()
					.describe("Whether candidate can lift up to 150 lbs"),
				hasWeekendAvailability: z
					.boolean()
					.describe("Whether candidate is available for weekends"),
				hasLongShiftAvailability: z
					.boolean()
					.describe("Whether candidate is available for 10-12 hour shifts"),

				// Preferred qualifications
				hasDeliveryExperience: z
					.boolean()
					.describe("Whether candidate has prior delivery experience"),
				hasCourierExperience: z
					.boolean()
					.describe("Whether candidate has prior courier experience"),
				hasTimeManagementSkills: z
					.boolean()
					.describe("Whether candidate demonstrated time management skills"),
				hasOrganizationalSkills: z
					.boolean()
					.describe("Whether candidate demonstrated organizational skills"),
				canWorkIndependently: z
					.boolean()
					.describe("Whether candidate can work independently"),

				// Evaluation results
				isQualified: z
					.boolean()
					.describe("Final qualification decision: true if qualified"),
				matchScore: z
					.number()
					.int()
					.min(0)
					.max(100)
					.describe("Match score from 0-100"),
				mandatoryBreakdown: z
					.array(
						z.object({
							name: z.string(),
							passed: z.boolean(),
							reason: z.string(),
						}),
					)
					.describe("Breakdown of each mandatory requirement"),
				preferredBreakdown: z
					.array(
						z.object({
							name: z.string(),
							has: z.boolean(),
							points: z.number(),
						}),
					)
					.describe("Breakdown of each preferred qualification with points"),
				reasoning: z
					.string()
					.describe("2-3 sentence summary of the qualification decision"),
			}),
			execute: async (input) => {
				try {
					const candidate = await prisma.candidate.create({
						data: {
							firstName: input.firstName,
							lastName: input.lastName,
							email: input.email,
							phone: input.phone,

							age: input.age,
							hasValidDriversLicense: input.hasValidDriversLicense,
							hasCleanDrivingRecord: input.hasCleanDrivingRecord,
							passesBackgroundScreening: input.passesBackgroundScreening,
							passesDrugScreening: input.passesDrugScreening,
							canLiftUpTo150Lbs: input.canLiftUpTo150Lbs,
							hasWeekendAvailability: input.hasWeekendAvailability,
							hasLongShiftAvailability: input.hasLongShiftAvailability,

							hasDeliveryExperience: input.hasDeliveryExperience,
							hasCourierExperience: input.hasCourierExperience,
							hasTimeManagementSkills: input.hasTimeManagementSkills,
							hasOrganizationalSkills: input.hasOrganizationalSkills,
							canWorkIndependently: input.canWorkIndependently,

							isQualified: input.isQualified,
							matchScore: input.matchScore,
							mandatoryBreakdown: input.mandatoryBreakdown as any,
							preferredBreakdown: input.preferredBreakdown as any,
							reasoning: input.reasoning,
							evaluatedAt: new Date(),
							evaluatedBy: "gpt-4o-mini",
						},
					});

					return {
						success: true,
						candidateId: candidate.id,
						message: `Candidate ${candidate.firstName} ${candidate.lastName} saved successfully with match score ${candidate.matchScore}/100. Status: ${candidate.isQualified ? "QUALIFIED" : "NOT QUALIFIED"}`,
					};
				} catch (error: any) {
					// Handle duplicate email
					if (error?.code === "P2002") {
						return {
							success: false,
							message: `A candidate with email ${input.email} already exists in the system.`,
						};
					}
					console.error("Error saving candidate:", error);
					return {
						success: false,
						message: "Failed to save candidate evaluation. Please try again.",
					};
				}
			},
		}),

		/**
		 * Look up an existing candidate by email to check if they've already
		 * been screened or to retrieve their information.
		 */
		lookupCandidateByEmail: tool({
			description:
				"Look up a candidate in the database by their email address. Use this to check if a candidate has already been screened before starting a new interview.",
			inputSchema: z.object({
				email: z.string().email().describe("Email address to look up"),
			}),
			execute: async ({ email }) => {
				const candidate = await prisma.candidate.findUnique({
					where: { email },
				});

				if (!candidate) {
					return {
						found: false,
						message: `No candidate found with email ${email}.`,
					};
				}

				return {
					found: true,
					candidate: {
						id: candidate.id,
						name: `${candidate.firstName} ${candidate.lastName}`,
						email: candidate.email,
						isQualified: candidate.isQualified,
						matchScore: candidate.matchScore,
						evaluatedAt: candidate.evaluatedAt,
						reasoning: candidate.reasoning,
					},
					message: candidate.evaluatedAt
						? `Candidate ${candidate.firstName} ${candidate.lastName} was previously screened on ${candidate.evaluatedAt.toLocaleDateString()} with a score of ${candidate.matchScore}/100.`
						: `Candidate ${candidate.firstName} ${candidate.lastName} exists but has not been evaluated yet.`,
				};
			},
		}),


		/**
		 * Update an existing candidate's information.
		 */
		updateCandidateInfo: tool({
			description:
				"Update an existing candidate's information in the database. Use this when you need to correct or update details for a candidate that already exists.",
			inputSchema: z.object({
				email: z
					.string()
					.email()
					.describe("Email address of the candidate to update"),
				firstName: z.string().optional().describe("Candidate's first name"),
				lastName: z.string().optional().describe("Candidate's last name"),
				phone: z.string().optional().describe("Candidate's phone number"),
				age: z.number().int().optional().describe("Candidate's age"),

				// Mandatory qualifications
				hasValidDriversLicense: z.boolean().optional(),
				hasCleanDrivingRecord: z.boolean().optional(),
				passesBackgroundScreening: z.boolean().optional(),
				passesDrugScreening: z.boolean().optional(),
				canLiftUpTo150Lbs: z.boolean().optional(),
				hasWeekendAvailability: z.boolean().optional(),
				hasLongShiftAvailability: z.boolean().optional(),

				// Preferred qualifications
				hasDeliveryExperience: z.boolean().optional(),
				hasCourierExperience: z.boolean().optional(),
				hasTimeManagementSkills: z.boolean().optional(),
				hasOrganizationalSkills: z.boolean().optional(),
				canWorkIndependently: z.boolean().optional(),

				// Evaluation results
				isQualified: z.boolean().optional(),
				matchScore: z.number().int().min(0).max(100).optional(),
				reasoning: z.string().optional(),
			}),
			execute: async (input) => {
				const { email, ...updates } = input;

				try {
					const candidate = await prisma.candidate.update({
						where: { email },
						data: {
							...updates,
							// Update evaluatedAt if evaluation-related fields are changed
							...(updates.isQualified !== undefined ||
							updates.matchScore !== undefined
								? { evaluatedAt: new Date(), evaluatedBy: "gpt-4o-mini" }
								: {}),
						},
					});

					return {
						success: true,
						message: `Candidate ${candidate.firstName} ${candidate.lastName} updated successfully.`,
						candidate: {
							id: candidate.id,
							firstName: candidate.firstName,
							lastName: candidate.lastName,
							email: candidate.email,
							updatedAt: candidate.updatedAt,
						},
					};
				} catch (error: any) {
					if (error?.code === "P2025") {
						return {
							success: false,
							message: `Candidate with email ${email} not found.`,
						};
					}
					console.error("Error updating candidate:", error);
					return {
						success: false,
						message: `Failed to update candidate: ${error.message}`,
					};
				}
			},
		}),
	},

	onStepFinish: async ({ usage, finishReason, toolCalls }) => {
		console.log("[Agent Step]", {
			tokens: usage.totalTokens,
			finishReason,
			tools: toolCalls?.map((tc) => tc.toolName),
		});
	},
});
