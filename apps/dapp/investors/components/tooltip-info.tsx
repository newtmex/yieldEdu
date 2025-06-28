import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { HelpCircle } from "lucide-react";

export function TooltipInfo({
	content,
	className,
}: {
	content: string;
	className?: ClassValue;
}) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<span className={cn("cursor-help text-muted-foreground", className)}>
						<HelpCircle className="size-3 text-inherit" />
					</span>
				</TooltipTrigger>
				<TooltipContent className="max-w-xs text-sm">{content}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
