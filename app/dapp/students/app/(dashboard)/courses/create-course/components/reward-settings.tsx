import React from "react";
import { TooltipInfo } from "@/components/tooltip-info";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Gift } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UseFormReturn } from "react-hook-form";
import { CourseFormData } from "../page";
import { Switch } from "@/components/ui/switch";

const RewardSettings = ({
	form,
	watchedData,
	isPending,
}: {
	form: UseFormReturn<CourseFormData>;
	watchedData: CourseFormData;
	isPending: boolean;
}) => {
	return (
		<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
			<Card className="opacity-40 pointer-events-none">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Gift className="h-5 w-5" />
						Reward Settings
					</CardTitle>
					<p className="text-sm text-muted-foreground">
						Configure points and rewards for course completion
					</p>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* <FormField
						control={form.control}
						name="rewards.enabled"
						render={({ field }) => ( */}
					<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
						<div className="space-y-0.5">
							<FormLabel className="text-base">
								Enable Rewards for this Course{" "}
								<TooltipInfo
									className="text-muted-foreground hidden md:flex"
									content="Enable point rewards for students who complete lessons and quizzes in this course"
								/>
							</FormLabel>

							<div className="text-sm text-muted-foreground">
								Students will earn points for completing lessons and answering
								quiz questions correctly
							</div>
						</div>
						<FormControl>
							<Switch
								// checked={field.value}
								// onCheckedChange={field.onChange}
								disabled={isPending}
							/>
						</FormControl>
					</FormItem>
					{/* )}
					 /> */}

					{/* {watchedData.rewards?.enabled && (
						<div className="space-y-4 p-4 bg-muted/30 rounded-lg">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<FormField
									control={form.control}
									name="rewards.pointsPerLesson"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Points per Completed Lesson *{" "}
												<TooltipInfo
													className="text-muted-foreground hidden md:flex"
													content="Points awarded when a student completes a lesson"
												/>
											</FormLabel>
											<FormControl>
												<Input
													disabled={isPending}
													type="number"
													min="1"
													max="1000"
													placeholder="e.g., 10"
													{...field}
													// onChange={(e) =>
													// 	field.onChange(
													// 		e.target.value
													// 			? parseInt(e.target.value)
													// 			: undefined
													// 	)
													// }
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="rewards.pointsPerQuizAnswer"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Points per Correct Quiz Answer *{" "}
												<TooltipInfo
													className="text-muted-foreground hidden md:flex"
													content="Points awarded for each correct quiz answer"
												/>
											</FormLabel>
											<FormControl>
												<Input
													disabled={isPending}
													type="number"
													min="1"
													max="100"
													placeholder="e.g., 5"
													{...field}
													// onChange={(e) =>
													// 	field.onChange(
													// 		e.target.value
													// 			? parseInt(e.target.value)
													// 			: undefined
													// 	)
													// }
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="rewards.maxCoursePoints"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Maximum Points for the Course *{" "}
												<TooltipInfo
													className="text-muted-foreground hidden md:flex"
													content="Maximum total points a student can earn from this course"
												/>
											</FormLabel>
											<FormControl>
												<Input
													disabled={isPending}
													type="number"
													min="1"
													max="10000"
													placeholder="e.g., 500"
													{...field}
													// onChange={(e) =>
													// 	field.onChange(
													// 		e.target.value
													// 			? parseInt(e.target.value)
													// 			: undefined
													// 	)
													// }
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<Alert>
								<AlertTitle>Reward Preview</AlertTitle>
								<AlertDescription>
									Students will earn up to{" "}
									{watchedData.rewards?.maxCoursePoints || 0} points from this
									course
									{watchedData.rewards?.pointsPerLesson && (
										<>
											<p className="text-lime-500 dark:text-lime-400">
												({watchedData.rewards.pointsPerLesson} points per lesson
												completion
												{watchedData.rewards?.pointsPerQuizAnswer &&
													`, ${watchedData.rewards.pointsPerQuizAnswer} points per correct quiz answer`}
												)
											</p>
											{watchedData.rewards.maxCoursePoints &&
												watchedData?.rewards?.pointsPerQuizAnswer && (
													<p>
														remaining{" "}
														<span className="text-lime-500 dark:text-lime-400">
															{watchedData.rewards?.maxCoursePoints -
																(watchedData.rewards.pointsPerLesson +
																	watchedData?.rewards?.pointsPerQuizAnswer)}
														</span>{" "}
														will be given when course is completed
													</p>
												)}
										</>
									)}
								</AlertDescription>
							</Alert>
						</div>
					)} */}
				</CardContent>
			</Card>
		</div>
	);
};

export default RewardSettings;
