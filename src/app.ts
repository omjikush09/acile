import express, {
	type Request,
	type Response,
	type NextFunction,
} from "express";
import candidateRoutes from "./routes/candidate.routes";
import chatRoutes from "./routes/chat.routes";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_req: Request, res: Response) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/candidates", candidateRoutes);
app.use("/api/chat", chatRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
	res.status(404).json({
		success: false,
		error: "Route not found",
	});
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
	console.error("Error:", err);
	res.status(500).json({
		success: false,
		error: "Internal server error",
		message: process.env.NODE_ENV === "development" ? err.message : undefined,
	});
});

export default app;
