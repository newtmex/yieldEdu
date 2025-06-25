import React, { useState } from "react";
import { TabsContent } from "./ui/tabs";
import QuestionCard from "./QuestionCard";
import { Button } from "./ui/button";
import { getRandomQuestions } from "@/data/questions";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { getYieldTokenConfig } from "@/lib/utils";
import { useSimulateContract, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { useAppKitAccount } from "@reown/appkit/react";
import { toast } from "@/hooks/use-toast";

const PASSING_SCORE = 70;
const QUESTIONS_PER_SESSION = 5;

const LearnSteps = () => {
	const [questions, setQuestions] = useState(
		getRandomQuestions(QUESTIONS_PER_SESSION)
	);
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [answers, setAnswers] = useState<string[]>([]);
	const [isComplete, setIsComplete] = useState(false);
	const [score, setScore] = useState(0);
	const queryClient = useQueryClient();
	const { isConnected, address } = useAppKitAccount();

	const handleAnswer = (answer: string) => {
		const newAnswers = [...answers];
		newAnswers[currentQuestion] = answer;
		setAnswers(newAnswers);
	};

	const calculateScore = () => {
		const correctAnswers = answers.filter(
			(answer, index) => answer === questions[index].correctAnswer
		);
		return (correctAnswers.length / questions.length) * 100;
	};

	const handleNext = () => {
		if (currentQuestion < questions.length - 1) {
			setCurrentQuestion((curr) => curr + 1);
		} else {
			setScore(calculateScore());
			setIsComplete(true);
		}
	};

	const handlePrev = () => {
		setCurrentQuestion((curr) => Math.max(0, curr - 1));
	};

	const handleRestart = () => {
		setQuestions(getRandomQuestions(QUESTIONS_PER_SESSION));
		setCurrentQuestion(0);
		setAnswers([]);
		setIsComplete(false);
		setScore(0);
	};

	const { data: setStudentSimulator } = useSimulateContract({
		...getYieldTokenConfig("setStudentStatus", [address, true]),
		query: {
			enabled: !!address,
		},
	});

	const { writeContract: claim, isPending: isPendingClaim } =
		useWriteContract();

	const { writeContract: setStudent, isPending: isPendingStudent } =
		useWriteContract();

	const { data: claimSimulator } = useSimulateContract({
		...getYieldTokenConfig("mintForStudent", [address, parseEther("0.5")]),
		query: {
			enabled: !!address,
		},
	});

	const handleClaim = async () => {
		try {
			if (setStudentSimulator?.request)
				setStudent(setStudentSimulator.request, {
					onError(error) {
						console.log(error);
						if (error.message.includes("User rejected the request")) {
							toast({
								variant: "destructive",
								title: "Transaction Rejected",
								description: "You rejected the transaction",
							});
							return;
						}
						toast({
							variant: "destructive",
							title: "Transaction Rejected",
							description: "Something went wrong",
						});
					},
					onSuccess() {
						if (claimSimulator?.request)
							claim(claimSimulator.request, {
								onSuccess() {
									queryClient.invalidateQueries();
									toast({
										title: "Claim Success",
										description: "You have received 0.5 FYT tokens",
									});
									handleRestart();
								},
								onError(error) {
									console.log(error);
									if (error.message.includes("User rejected the request")) {
										toast({
											variant: "destructive",
											title: "Transaction Rejected",
											description: "You rejected the transaction",
										});
									}
								},
							});
					},
				});
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<TabsContent value="learn" className="space-y-4">
			{!isComplete ? (
				<>
					<div className="mb-6">
						<div className="flex items-center justify-between mb-2">
							<p className="text-sm text-gray-500">
								Question {currentQuestion + 1} of {questions.length}
							</p>
							<p className="text-sm text-gray-500">
								{(((currentQuestion + 1) / questions.length) * 100).toFixed(0)}%
							</p>
						</div>
						<div className="w-full bg-zinc-800 h-2 rounded-full">
							<div
								className="bg-blue-600 h-2 rounded-full transition-all duration-300"
								style={{
									width: `${((currentQuestion + 1) / questions.length) * 100}%`,
								}}
							/>
						</div>
					</div>
					<QuestionCard
						question={questions[currentQuestion]}
						onAnswer={handleAnswer}
						selectedAnswer={answers[currentQuestion] || null}
						isAnswered={!!answers[currentQuestion]}
					/>
					<div className="flex justify-between mt-4">
						<Button
							type="button"
							variant={"default"}
							className="enabled:bg-blue-600"
							onClick={handlePrev}
							disabled={currentQuestion === 0}
						>
							Previous
						</Button>
						<Button
							type="button"
							variant={"default"}
							onClick={handleNext}
							className="enabled:bg-blue-600"
							disabled={!answers[currentQuestion]}
						>
							{currentQuestion === questions.length - 1 ? "Finish" : "Next"}
						</Button>
					</div>
				</>
			) : (
				<div className="text-center space-y-4">
					<h3 className="text-2xl font-bold">
						{score >= PASSING_SCORE ? "Congratulations! 🎉" : "Try Again 😢"}
					</h3>
					<p className="text-lg">Your score: {score.toFixed(1)}%</p>
					{score >= PASSING_SCORE ? (
						<Button
							disabled={isPendingClaim || isPendingStudent || !isConnected}
							type="button"
							variant={"default"}
							onClick={handleClaim}
							className={cn(
								"flex w-full disabled:bg-[#0E76FD80] bg-[#0E76FD] enabled:hover:bg-[#0E76FD80] active:bg-[#0E76FD] text-white border-none items-center gap-2"
							)}
						>
							{!isConnected ? (
								"Connect Your wallet to claim"
							) : isPendingClaim || isPendingStudent ? (
								<>
									<div className="size-6 rounded-full animate-[spin_0.5s_linear_infinite] border-b-transparent border-[3px] border-white" />
									{isPendingClaim
										? "Claiming..."
										: isPendingStudent && "Waiting for Approval..."}
								</>
							) : (
								"	Claim Reward Tokens"
							)}
						</Button>
					) : (
						<Button onClick={handleRestart} className="w-full">
							Retry Quiz
						</Button>
					)}
				</div>
			)}
		</TabsContent>
	);
};

export default LearnSteps;
