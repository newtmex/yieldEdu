"use client";
import { Minus, Plus } from "lucide-react";
import { Button } from "./ui/button";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useFieldArray, Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const QuizCreation: React.FC<{
	form: any;
	isPending: boolean;
}> = ({ form, isPending }) => {
	const quizArrays = useFieldArray({
		control: form.control,
		name: "quizzes",
	});

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Quizzes</CardTitle>
						<p className="text-sm text-muted-foreground mt-1">
							Add quizzes to test understanding
						</p>
						{form.formState.errors.quizzes?.root?.message && (
							<p className="text-sm text-destructive">
								{form.formState.errors.quizzes.root.message}
							</p>
						)}
					</div>
					<Button
						type="button"
						onClick={() => {
							quizArrays.append({
								question: "",
								options: ["", "", "", ""],
								correctAnswer: 0,
							});
						}}
						variant="outline"
						size="sm"
						className="gap-2"
						disabled={isPending}
					>
						<Plus className="h-4 w-4" />
						Add Question
					</Button>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{quizArrays.fields.map((question, questionIndex) => (
					<div
						key={questionIndex}
						className="p-4 bg-muted/30 rounded-lg space-y-4"
					>
						{form.formState.errors.quizzes?.[questionIndex]?.options?.root
							?.message && (
							<p className="text-sm text-destructive">
								{
									form.formState.errors.quizzes?.[questionIndex]?.options
										?.root?.message
								}
							</p>
						)}

						<div className="flex items-center justify-between">
							<Label>Question {questionIndex + 1}</Label>
							{quizArrays.fields.length > 1 && (
								<Button
									type="button"
									onClick={() => {
										quizArrays.remove(questionIndex);
									}}
									variant="ghost"
									size="sm"
									className="text-destructive"
									disabled={isPending}
								>
									<Minus className="h-4 w-4" />
								</Button>
							)}
						</div>

						<FormField
							control={form.control}
							name={`quizzes.${questionIndex}.question`}
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											placeholder="Enter your question"
											{...field}
											disabled={isPending}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="space-y-3">
							<Label className="text-sm font-medium">Answer Options</Label>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{[0, 1, 2, 3].map((optionIndex) => (
									<div
										key={optionIndex}
										className="flex items-center space-x-2"
									>
										<Controller
											control={form.control}
											name={`quizzes.${questionIndex}.correctAnswer`}
											render={({ field }) => (
												<Input
													type="radio"
													checked={field.value === optionIndex}
													onChange={() => field.onChange(optionIndex)}
													className="size-3"
													disabled={isPending}
												/>
											)}
										/>

										<FormField
											control={form.control}
											name={`quizzes.${questionIndex}.options.${optionIndex}`}
											render={({ field }) => (
												<FormItem className="flex-1">
													<FormControl>
														<Input
															placeholder={`Option ${optionIndex + 1}`}
															{...field}
															disabled={isPending}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								))}
								{form.formState.errors.quizzes?.[questionIndex]?.options
									?.message && (
									<p className="text-sm text-destructive">
										{
											form.formState.errors.quizzes?.[questionIndex]
												?.options?.message
										}
									</p>
								)}
							</div>
							<div className="text-sm text-muted-foreground">
								Select the radio button next to the correct answer
							</div>
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
};

export default QuizCreation;