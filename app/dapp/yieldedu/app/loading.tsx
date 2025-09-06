import React from "react";

const Loading = () => {
	return (
		<div className="h-screen z-20 text-white flex items-center justify-center w-full absolute inset-0 bg-white/80 dark:bg-slate-900/90">
			<div className="size-20 rounded-full animate-[spin_0.8s_linear_infinite;] border-b-transparent border-[7px] border-lime-400"></div>
		</div>
	);
};

export default Loading;
