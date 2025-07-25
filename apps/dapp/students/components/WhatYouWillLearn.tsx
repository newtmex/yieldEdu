import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Plus, Minus } from "lucide-react";
import { Button } from "./ui/button";
import { FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { TooltipInfo } from "./tooltip-info";
import { Label } from "./ui/label";
import { CourseFormData } from "@/app/(dashboard)/courses/create-course/page";

interface WhatYouWillLearnProps {
	form: UseFormReturn<CourseFormData>;
	isPending?: boolean;
}

const WhatYouWillLearn: React.FC<WhatYouWillLearnProps> = ({
	form,
	isPending = false,
}) => {
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "whatYouWillLearn" as any,
	});

	const addLearningOutcome = () => {
		append("");
	};

	const removeLearningOutcome = (index: number) => {
		if (fields.length > 1) {
			remove(index);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center justify-between">
					<Label>
						What You Will Learn <span className="text-destructive">*</span>
						<TooltipInfo
							className="text-muted-foreground hidden md:flex"
							content="Key takeaways and skills students will gain - these appear as bullet points on your course page (minimum 1 required)"
						/>
					</Label>
				</div>
				<Button
					type="button"
					onClick={addLearningOutcome}
					variant="outline"
					size="sm"
					className="gap-2"
					disabled={isPending}
				>
					<Plus className="h-4 w-4" />
					Add Item
				</Button>
			</div>

			{/* Array-level validation error */}
			{form.formState.errors.whatYouWillLearn?.root && (
				<p className="text-sm font-medium text-destructive">
					{String(
						form.formState.errors.whatYouWillLearn.root.message ||
							"Validation error"
					)}
				</p>
			)}

			{/* Custom validation message for minimum array length */}
			{form.formState.errors.whatYouWillLearn &&
				typeof form.formState.errors.whatYouWillLearn.message === "string" && (
					<p className="text-sm font-medium text-destructive">
						{form.formState.errors.whatYouWillLearn.message}
					</p>
				)}

			<div className="space-y-3">
				{fields.map((field, index) => (
					<div key={field.id} className="flex items-center gap-2">
						<div className="flex-1">
							<FormField
								control={form.control}
								name={`whatYouWillLearn.${index}` as any}
								render={({ field: inputField }) => (
									<FormItem>
										<FormControl>
											<Input
												{...inputField}
												placeholder={`Learning outcome ${index + 1}`}
												disabled={isPending}
												className={
													form.formState.errors.whatYouWillLearn?.[index]
														? "border-destructive focus-visible:ring-destructive"
														: ""
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						{fields.length > 1 && (
							<Button
								type="button"
								onClick={() => removeLearningOutcome(index)}
								variant="ghost"
								size="sm"
								className="text-destructive shrink-0"
								disabled={isPending}
							>
								<Minus className="h-4 w-4" />
							</Button>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default WhatYouWillLearn;
