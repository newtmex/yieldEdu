import React from "react";

interface AudioVisualizerProps {
	isActive: boolean;
	barCount?: number;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
	isActive,
	barCount = 5,
}) => {
	return (
		<div
			className={`flex items-center h-5 transition-opacity duration-300 ${
				isActive ? "opacity-100" : "opacity-0"
			}`}
		>
			{Array.from({ length: barCount }).map((_, index) => (
				<div
					key={index}
					className="audio-bar"
					style={
						{
							"--delay": index,
							animationPlayState: isActive ? "running" : "paused",
							height: isActive
								? `${Math.floor(Math.random() * 15) + 5}px`
								: "5px",
						} as React.CSSProperties
					}
				/>
			))}
		</div>
	);
};

export default AudioVisualizer;
