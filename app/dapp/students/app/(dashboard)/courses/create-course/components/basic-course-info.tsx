import { TooltipInfo } from "@/components/tooltip-info";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus } from "lucide-react";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CourseFormData } from "../page";

const BasicCourseInfo = ({
	form,
	isPending,
	watchedData,
}: {
	form: UseFormReturn<CourseFormData>;
	isPending: boolean;
	watchedData: CourseFormData;
}) => {
	return (
		<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
			<Card>
				<CardHeader>
					<CardTitle>Basic Information</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<FormField
						control={form.control}
						name="title"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Course Title <span className="text-destructive">*</span>
									<TooltipInfo
										className="text-muted-foreground hidden md:flex"
										content="The main title that will appear on your course page and in search results"
									/>
								</FormLabel>

								<FormControl>
									<Input
										placeholder="e.g., Introduction to DeFi"
										{...field}
										disabled={isPending}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Short Description <span className="text-destructive">*</span>
									<TooltipInfo
										className="text-muted-foreground hidden md:flex"
										content="A brief overview that appears in course listings and search results"
									/>
								</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Brief overview of the course..."
										rows={3}
										{...field}
										disabled={isPending}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="longDescription"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Long Description <span className="text-destructive">*</span>
									<TooltipInfo
										className="text-muted-foreground hidden md:flex"
										content="Detailed description shown on the course page to help students understand what they'll get"
									/>
								</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Detailed description of the course content, objectives, and outcomes..."
										rows={6}
										{...field}
										disabled={isPending}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* What You Will Learn */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="category"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Category <span className="text-destructive">*</span>
										<TooltipInfo
											className="text-muted-foreground hidden md:flex"
											content="Course category for organization and discovery"
										/>
									</FormLabel>

									<FormControl>
										<Input placeholder="Finance" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="difficulty"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Difficulty <span className="text-destructive">*</span>
										<TooltipInfo
											className="text-muted-foreground hidden md:flex"
											content="Difficulty level helps students choose appropriate courses"
										/>
									</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
										disabled={isPending}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select difficulty level" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="Beginner">Beginner</SelectItem>
											<SelectItem value="Intermediate">Intermediate</SelectItem>
											<SelectItem value="Advanced">Advanced</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<Label>
								What You Will Learn <span className="text-destructive">*</span>
								<TooltipInfo
									className="text-muted-foreground hidden md:flex"
									content="Key takeaways and skills students will gain - these appear as bullet points on your course page"
								/>
							</Label>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => {
									const currentItems = form.getValues("whatYouWillLearn");
									form.setValue("whatYouWillLearn", [...currentItems, ""]);
								}}
								className="gap-2"
								disabled={isPending}
							>
								<Plus className="h-4 w-4" />
								Add Item
							</Button>
						</div>
						{form.formState.errors.whatYouWillLearn?.root?.message && (
							<p className="text-sm text-destructive font-medium">
								{form.formState.errors.whatYouWillLearn.root.message}
							</p>
						)}
						{watchedData.whatYouWillLearn?.map((_, index) => (
							<div key={index} className="flex gap-2">
								<FormField
									control={form.control}
									name={`whatYouWillLearn.${index}`}
									render={({ field }) => (
										<FormItem className="flex-1">
											<FormControl>
												<Input
													placeholder="e.g., Understand blockchain fundamentals"
													{...field}
													disabled={isPending}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{watchedData.whatYouWillLearn.length > 1 && (
									<Button
										disabled={isPending}
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => {
											const currentItems = form.getValues("whatYouWillLearn");
											const newItems = currentItems.filter(
												(_, i) => i !== index
											);
											form.setValue("whatYouWillLearn", newItems);
										}}
										className="text-destructive"
									>
										<Minus className="h-4 w-4" />
									</Button>
								)}
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default BasicCourseInfo;
