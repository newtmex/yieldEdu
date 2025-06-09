import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClassValue } from "clsx";
import { cn } from "@/lib/utils";

export function ThemeSwitcher({
	className,
	theme,
	setTheme,
}: {
	className?: ClassValue;
	setTheme: React.Dispatch<React.SetStateAction<string>>;
	theme: string | undefined;
}) {
	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
			className={cn(
				"text-slate-600 dark:text-slate-300 hover:text-lime-500 hover:bg-lime-500/10",
				className
			)}
		>
			<Moon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<Sun className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
