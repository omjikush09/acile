import { Router, type Request, type Response } from "express";
import { pipeAgentUIStreamToResponse, type UIMessage } from "ai";
import { screeningAgent } from "../agents/screeningAgent";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
	try {
		const { messages }: { messages: UIMessage[] } = req.body;

		await pipeAgentUIStreamToResponse({
			response: res,
			agent: screeningAgent,
			uiMessages: messages,
		});
	} catch (error) {
		console.error("Chat API error:", error);
		if (!res.headersSent) {
			res.status(500).json({
				success: false,
				error: "Failed to process chat request",
			});
		}
	}
});

export default router;
