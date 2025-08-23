"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/utils/supabase/server";
import { ClassValue } from "clsx";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

function Feedback({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: ClassValue;
}) {
	const [feedback, setFeedback] = useState("");
	const [loading, setLoading] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const handleSendFeedback = async (e: FormEvent) => {
		e.preventDefault();
		try {
			setLoading(true);

			const { error } = await supabase.from("feedbacks").insert([{ feedback }]);

			if (error) {
				console.log(error);
			}

			setFeedback("");
			setShowModal(false);

			toast({
				variant: "default",
				title: "Feedback Sent!",
				description: "Thank you for submitting a feedback",
			});
		} catch (error) {
			console.log(error);
			toast({
				variant: "destructive",
				title: "An error occurred",
				description: "try again",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={cn(className)}>
			<Dialog modal={true} onOpenChange={setShowModal} open={showModal}>
				<DialogTrigger asChild>
					{/* <Button variant="outline">Feedback</Button> */}
					{children}
				</DialogTrigger>
				<DialogContent className="bg-white dark:bg-slate-900">
					<DialogHeader>
						<DialogTitle className="text-slate-900 dark:text-white">
							Send us a feedback
						</DialogTitle>
						<DialogDescription className="text-slate-400 dark:text-white">
							Share your feedback to help us enhance your experience
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSendFeedback} className="space-y-5">
						<Textarea
							disabled={loading}
							minLength={10}
							required
							onChange={(e) => setFeedback(e.target.value)}
							value={feedback}
							className="border-border !text-md text-black dark:text-white"
							id="feedback"
							placeholder="How can we improve yieldEdu?"
							aria-label="Send feedback"
						/>
						<Button disabled={loading} className="w-full" type="submit">
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Please wait
								</>
							) : (
								"	Send feedback"
							)}
						</Button>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default Feedback;
