"use client";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";

const FaqItem = ({
	question,
	answer,
}: {
	question: string;
	answer: string;
}) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
			<button
				className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
				onClick={() => setIsOpen(!isOpen)}
			>
				<h3 className="font-medium text-slate-900 dark:text-white">
					{question}
				</h3>
				<ChevronDown
					className={`w-5 h-5 text-slate-400 transition-transform ${
						isOpen ? "transform rotate-180" : ""
					}`}
				/>
			</button>
			{isOpen && (
				<div className="px-4 pb-4 text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700/50">
					<p>{answer}</p>
				</div>
			)}
		</div>
	);
};

export default FaqItem;
