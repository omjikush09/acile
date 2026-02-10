import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, useCallback } from "react";

function formatTime(date: Date): string {
	return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function App() {
	const { messages, sendMessage, status, stop, error } = useChat({
		transport: new DefaultChatTransport({
			api: "/api/chat",
		}),
	});

	const [input, setInput] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const isStreaming = status === "streaming";
	const isSubmitted = status === "submitted";
	const isLoading = isStreaming || isSubmitted;

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, status]);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setInput(e.target.value);
			const el = e.target;
			el.style.height = "auto";
			el.style.height = Math.min(el.scrollHeight, 160) + "px";
		},
		[],
	);

	const handleSubmit = useCallback(
		(text?: string) => {
			const value = text ?? input.trim();
			if (!value || isLoading) return;
			sendMessage({ text: value });
			setInput("");
			if (inputRef.current) inputRef.current.style.height = "auto";
		},
		[input, isLoading, sendMessage],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				handleSubmit();
			}
		},
		[handleSubmit],
	);

	return (
		<div className="flex flex-col h-screen bg-bg-primary overflow-hidden font-sans text-text-primary selection:bg-accent selection:text-white">
			{/* Header */}
			<header className="border-b border-border bg-[rgba(10,10,15,0.8)] backdrop-blur-xl z-20 shrink-0 relative flex justify-center">
				<div className="w-full max-w-4xl px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="w-10 h-10 rounded-xl bg-linear-to-br from-accent to-[#448aff] flex items-center justify-center font-bold text-xl text-white shadow-[0_4px_20px_rgba(124,77,255,0.3)] ring-1 ring-white/10">
							A
						</div>
						<div className="flex flex-col">
							<span className="text-base font-semibold leading-tight tracking-tight">
								Ancile Screening
							</span>
							<span className="text-xs text-text-muted font-medium mt-0.5">
								FedEx Ground ISP · Delivery Driver
							</span>
						</div>
					</div>
					<div className="flex items-center gap-2.5 text-xs font-medium text-text-muted/80 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
						<div
							className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${
								isStreaming
									? "bg-accent animate-pulse text-accent"
									: "bg-success text-success"
							}`}
						/>
						<span>
							{isSubmitted
								? "Thinking..."
								: isStreaming
									? "Streaming"
									: "System Ready"}
						</span>
					</div>
				</div>
			</header>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto relative scroll-smooth flex flex-col items-center">
				{/* Ambient Background Glow */}
				<div className="fixed top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/5 blur-[120px] rounded-full pointer-events-none z-0" />

				<div className="w-full max-w-4xl px-6 py-8 min-h-full flex flex-col relative z-10">
					{messages.length === 0 ? (
						/* Empty State */
						<div className="flex flex-col items-center justify-center flex-1 text-center animate-fade-in my-auto pb-10">
							<div className="relative group mb-8">
								<div className="absolute -inset-4 bg-linear-to-r from-accent/20 to-blue-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-1000" />
								<div className="relative w-24 h-24 rounded-4xl bg-linear-to-br from-bg-secondary to-bg-tertiary border border-white/10 flex items-center justify-center text-4xl shadow-2xl">
									<span className="bg-linear-to-br from-white to-white/50 bg-clip-text text-transparent">
										✦
									</span>
								</div>
							</div>

							<h2 className="text-3xl font-semibold mb-3 tracking-tight bg-linear-to-b from-white to-white/60 bg-clip-text text-transparent">
								Candidate Screening Interview
							</h2>
							<p className="text-base text-text-secondary/80 max-w-[540px] leading-relaxed mb-10 text-balance">
								Welcome to the automated screening process for the
								<span className="text-text-primary font-medium">
									{" "}
									Delivery Driver{" "}
								</span>
								position at Tsavo West Inc.
							</p>

							<button
								onClick={() =>
									handleSubmit(
										"Hi, I'm interested in the delivery driver position.",
									)
								}
								className="group relative px-8 py-4 bg-white text-black rounded-full font-medium text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] active:scale-[0.98]"
							>
								<span className="relative z-10 flex items-center gap-2">
									Start Interview
									<span className="group-hover:translate-x-0.5 transition-transform">
										→
									</span>
								</span>
							</button>
						</div>
					) : (
						/* Message List */
						<div className="flex flex-col gap-6 w-full pb-6">
							{messages.map((message) => (
								<div
									key={message.id}
									className={`flex gap-5 animate-fade-in-up group ${
										message.role === "user" ? "flex-row-reverse" : ""
									}`}
								>
									{/* Avatar */}
									<div
										className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-semibold shadow-lg mt-1 ${
											message.role === "assistant"
												? "bg-bg-secondary border border-white/10 text-white"
												: "bg-bg-secondary border border-white/10 text-text-secondary"
										}`}
									>
										{message.role === "user" ? (
											<div className="w-full h-full rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
												You
											</div>
										) : (
											<span className="text-lg bg-linear-to-br from-accent to-blue-400 bg-clip-text text-transparent">
												✦
											</span>
										)}
									</div>

									{/* Bubble */}
									<div
										className={`flex flex-col max-w-[80%] ${message.role === "user" ? "items-end" : "items-start"}`}
									>
										<div
											className={`px-6 py-4 text-[15px] leading-relaxed shadow-sm relative ${
												message.role === "assistant"
													? "bg-bg-secondary/80 border border-white/5 backdrop-blur-md rounded-2xl rounded-tl-sm text-text-primary/95"
													: "bg-[#2E2E3A] border border-white/5 text-white rounded-2xl rounded-tr-sm"
											}`}
										>
											{message.parts.map((part, index) =>
												part.type === "text" ? (
													<span key={index} className="whitespace-pre-wrap">
														{part.text}
													</span>
												) : null,
											)}
										</div>
										<div className="flex items-center gap-2 mt-2 px-1">
											<span className="text-[10px] uppercase tracking-wider font-medium text-text-muted/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
												{formatTime(new Date())}
											</span>
										</div>
									</div>
								</div>
							))}

							{/* Typing Indicator */}
							{isSubmitted && (
								<div className="flex gap-5 animate-fade-in-up">
									<div className="w-10 h-10 rounded-xl bg-bg-secondary border border-white/10 flex items-center justify-center shrink-0 text-lg shadow-lg mt-1">
										<span className="bg-linear-to-br from-accent to-blue-400 bg-clip-text text-transparent">
											✦
										</span>
									</div>
									<div className="flex items-center gap-1.5 px-5 py-4 bg-bg-secondary/40 border border-white/5 rounded-2xl rounded-tl-sm backdrop-blur-sm">
										<div className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce [animation-delay:-0.3s]" />
										<div className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce [animation-delay:-0.15s]" />
										<div className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" />
									</div>
								</div>
							)}
						</div>
					)}
					<div ref={messagesEndRef} className="h-4" />
				</div>
			</div>

			{/* Error Banner */}
			{error && (
				<div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-error/10 border border-error/20 rounded-xl backdrop-blur-md text-sm text-error animate-fade-in-up shadow-lg">
					<span className="text-lg">⚠</span>
					<span>{error.message || "Connection error. Please try again."}</span>
					<button
						onClick={() => handleSubmit()}
						className="ml-3 hover:bg-white/5 px-3 py-1.5 rounded-lg transition-colors font-medium"
					>
						Retry
					</button>
				</div>
			)}

			{/* Input Area */}
			<div className="shrink-0 z-20 relative bg-bg-primary">
				{/* Gradient fade above input */}
				<div className="absolute bottom-full left-0 right-0 h-12 bg-linear-to-t from-bg-primary via-bg-primary/80 to-transparent pointer-events-none" />

				<div className="flex justify-center pb-8 pt-2 px-6">
					<div className="w-full max-w-4xl relative group">
						{/* Glow effect behind input */}
						<div className="absolute -inset-0.5 bg-linear-to-r from-accent/20 to-blue-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />

						<form
							className="relative flex items-end gap-2 bg-bg-secondary border border-white/10 rounded-2xl p-2 transition-all duration-200 focus-within:ring-1 focus-within:ring-accent/20 focus-within:border-accent/30 shadow-xl"
							onSubmit={(e) => {
								e.preventDefault();
								handleSubmit();
							}}
							id="chat-form"
						>
							<textarea
								ref={inputRef}
								value={input}
								onChange={handleInputChange}
								onKeyDown={handleKeyDown}
								disabled={isLoading}
								placeholder="Type your message..."
								rows={1}
								id="chat-input"
								className="flex-1 bg-transparent border-none outline-none text-text-primary font-sans text-[15px] leading-relaxed resize-none min-h-[48px] max-h-48 py-3 px-4 placeholder:text-text-muted/60"
							/>
							<div className="pb-1 pr-1">
								{isLoading ? (
									<button
										type="button"
										onClick={() => stop()}
										id="stop-button"
										className="w-10 h-10 rounded-xl bg-error/10 text-error hover:bg-error/20 flex items-center justify-center transition-all duration-200"
									>
										<div className="w-3 h-3 bg-current rounded-sm animate-pulse" />
									</button>
								) : (
									<button
										type="submit"
										disabled={!input.trim()}
										id="send-button"
										className="w-10 h-10 rounded-xl bg-white text-black hover:bg-gray-200 disabled:opacity-20 disabled:hover:bg-white flex items-center justify-center transition-all duration-200 shadow-sm"
									>
										<svg
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											className={input.trim() ? "translate-x-0.5" : ""}
										>
											<path
												d="M5 12V6.66667C5 5.5621 5 5.00981 5.30785 4.77093C5.61571 4.53205 6.09639 4.7724 7.05776 5.25309L18.2307 10.8396C19.4101 11.4293 19.9997 11.7241 19.9997 12C19.9997 12.2759 19.4101 12.5707 18.2307 13.1604L7.05776 18.7469C6.09639 19.2276 5.61571 19.468 5.30785 19.2291C5 18.9902 5 18.4379 5 17.3333V12ZM5 12H12"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</button>
								)}
							</div>
						</form>
						<div className="w-full flex items-center justify-between mt-3 px-2">
							<div className="text-[10px] text-text-muted font-medium tracking-wide uppercase opacity-60">
								Ancile AI Screening
							</div>
							<div className="text-[10px] text-text-muted opacity-60">
								<strong>Return</strong> to send ·{" "}
								<strong>Shift + Return</strong> for new line
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
