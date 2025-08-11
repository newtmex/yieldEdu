import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { HelpCircle } from "lucide-react";
import React, { useEffect, useState } from "react";

function useIsTouchDevice() {
	const [isTouch, setIsTouch] = useState(false);
	useEffect(() => {
		setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
	}, []);
	return isTouch;
}

export function TooltipInfo({
	content,
	className,
	disabled,
	children,
	showHelp = true,
}: {
	content: string;
	className?: ClassValue;
	disabled?: boolean;
	children?: React.ReactNode;
	showHelp?: boolean;
}) {
	const isTouch = useIsTouchDevice();

	if (disabled)
		return (
			<span className={cn("cursor-help", className)}>
				{children}
				{showHelp && <HelpCircle className="size-3 text-muted-foreground" />}
			</span>
		);

	if (isTouch) {
		return (
			<Popover>
				<PopoverTrigger className={cn(className)}>
					{children}
					<span className={cn("cursor-help text-muted-foreground", className)}>
						{showHelp && (
							<HelpCircle className="size-3 text-muted-foreground" />
						)}
					</span>
				</PopoverTrigger>
				<PopoverContent className="max-w-xs text-sm">{content}</PopoverContent>
			</Popover>
		);
	}

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger className={cn(className)}>
					{children}
					<span className={cn("cursor-help", className)}>
						{showHelp && (
							<HelpCircle className="size-3 text-muted-foreground" />
						)}
					</span>
				</TooltipTrigger>
				<TooltipContent className="max-w-xs text-sm">{content}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
