import React from "react";

const Loading = () => {
	return (
		<div className="h-screen rounded-2xl z-20 text-white flex items-center justify-center w-full absolute inset-0 bg-background">
			<div
				className="inline-block w-12 h-12 rounded-full border-solid
         border-t-[3px] border-lime-400
         border-r-[3px]
         border-b-[0px] border-l-[0px]
         animate-spin"
			></div>
		</div>
	);
};

export default Loading;
