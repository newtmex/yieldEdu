"use client";
import React from "react";
import { Toaster } from "./ui/sonner";
import { useTheme } from "next-themes";

const ToastNotification = () => {
	const { theme } = useTheme();

	return (
		<Toaster
			theme={theme === "dark" ? "dark" : "light"}
			richColors
			expand
			closeButton
		/>
	);
};

export default ToastNotification;
