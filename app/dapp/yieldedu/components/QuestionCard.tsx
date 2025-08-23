import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Question } from "@/data/questions";

interface QuestionCardProps {
	question: Question;
	onAnswer: (answer: string) => void;
	selectedAnswer: string | null;
	isAnswered: boolean;
}

const QuestionCard = ({
	question,
	onAnswer,
	selectedAnswer,
	isAnswered,
}: QuestionCardProps) => {
	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold">{question.question}</h3>
			<div className="space-y-2">
				{question.answers
					.sort(() => Math.random() - 0.5)
					.map((answer, index) => {
						const isCorrect = answer === question.correctAnswer;
						const isSelected = answer === selectedAnswer;

						return (
							<div
								key={index}
								className={cn(
									"relative flex items-center p-4 rounded-lg border border-zinc-800 cursor-pointer transition-all",
									!isAnswered && "hover:border-blue-500 group",
									isAnswered && "opacity-30",
									isAnswered && isCorrect && "border-green-500 opacity-100",
									isAnswered &&
										isSelected &&
										!isCorrect &&
										"border-red-500 opacity-100",
									!isAnswered && isSelected && "border-blue-500 bg-blue-50"
								)}
								onClick={() => !isAnswered && onAnswer(answer)}
							>
								<div className="mr-3">
									<div
										className={cn(
											"w-5 h-5 border group-hover:border-blue-500 group-hover:bg-blue-500 rounded flex items-center justify-center",
											isAnswered &&
												isCorrect &&
												"border-green-500 bg-green-500",
											isAnswered &&
												isSelected &&
												!isCorrect &&
												"border-red-500 bg-red-500"
										)}
									>
										{(isSelected || (isAnswered && isCorrect)) && (
											<Check className={cn("h-4 w-4 text-white")} />
										)}
									</div>
								</div>
								<span
									className={cn(
										"flex-1 text-sm group-hover:text-blue-500",
										isAnswered && isCorrect && "text-green-600 font-medium",
										isAnswered && isSelected && !isCorrect && "text-red-600"
									)}
								>
									{answer}
								</span>
							</div>
						);
					})}
			</div>
		</div>
	);
};

export default QuestionCard;
