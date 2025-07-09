"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

interface Theme {
	id: string;
	name: string;
	icon: React.ComponentType<{ size?: number; className?: string }>;
	preview: {
		background: string;
		sidebar: string;
		primary: string;
		secondary: string;
	};
}

const themes: Theme[] = [
	{
		id: "light",
		name: "Light Mode",
		icon: Sun,
		preview: {
			background: "#ffffff",
			sidebar: "#f8fafc",
			primary: "#0f172a",
			secondary: "#64748b",
		},
	},
	{
		id: "dark",
		name: "Dark Mode",
		icon: Moon,
		preview: {
			background: "#0f172a",
			sidebar: "#1e293b",
			primary: "#f1f5f9",
			secondary: "#94a3b8",
		},
	},
];

const ThemeSwitcher: React.FC = () => {
	const { theme, setTheme } = useTheme();

	const handleThemeSelect = (themeId: string) => {
		setTheme(themeId);
	};

	return (
		<div className="mb-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{themes.map((themeOption) => {
					const IconComponent = themeOption.icon;
					const isSelected = theme === themeOption.id;

					return (
						<div
							key={themeOption.id}
							onClick={() => handleThemeSelect(themeOption.id)}
						>
							{/* Theme Preview Card */}
							<div
								className={`rounded-xl mt-5 p-4 border overflow-hidden relative cursor-pointer group transition-all duration-300 ${
									isSelected
										? "ring-2 ring-primary scale-105"
										: "hover:scale-105 hover:ring-1 hover:ring-border"
								}`}
								style={{ backgroundColor: themeOption.preview.background }}
							>
								{/* Mock browser header */}
								<div className="flex items-center gap-2 mb-4">
									<div className="w-3 h-3 rounded-full bg-red-500"></div>
									<div className="w-3 h-3 rounded-full bg-yellow-500"></div>
									<div className="w-3 h-3 rounded-full bg-green-500"></div>
								</div>

								{/* Mock sidebar */}
								<div className="flex gap-3 mb-4">
									<div
										className="w-16 rounded-lg p-2 space-y-2"
										style={{ backgroundColor: themeOption.preview.sidebar }}
									>
										<div
											className="w-full h-2 rounded"
											style={{
												backgroundColor: themeOption.preview.secondary,
											}}
										></div>
										<div
											className="w-full h-2 rounded"
											style={{
												backgroundColor: themeOption.preview.secondary,
											}}
										></div>
										<div
											className="w-full h-2 rounded"
											style={{
												backgroundColor: themeOption.preview.secondary,
											}}
										></div>
									</div>

									{/* Mock content area */}
									<div className="flex-1 space-y-3">
										<div
											className="h-4 rounded-lg shadow-sm"
											style={{
												backgroundColor: themeOption.preview.primary,
											}}
										></div>
										<div
											className="h-4 w-3/4 rounded-lg shadow-sm"
											style={{
												backgroundColor: themeOption.preview.secondary,
											}}
										></div>
										<div
											className="h-4 w-2/3 rounded-lg shadow-sm"
											style={{
												backgroundColor: themeOption.preview.primary,
											}}
										></div>
										<div
											className="h-4 w-1/2 rounded-lg shadow-sm"
											style={{
												backgroundColor: themeOption.preview.secondary,
											}}
										></div>
									</div>
								</div>
							</div>

							{/* Theme name and selection indicator */}
							<div className="flex items-center justify-between mt-4">
								<div className="flex items-center gap-3">
									<IconComponent size={20} className="text-foreground" />
									<span className="font-medium">{themeOption.name}</span>
								</div>
								<div
									className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
										isSelected
											? "border-primary bg-primary"
											: "border-muted-foreground/30 group-hover:border-muted-foreground/50"
									}`}
								>
									{isSelected && (
										<div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default ThemeSwitcher;
