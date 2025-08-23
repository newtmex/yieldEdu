import React from "react";
import Marquee from "react-fast-marquee";
import gainzswap from "@/public/gainzswap.jpg";
import opencampus from "@/public/opencampus.png";
import Image from "next/image";

const MarqueSection = () => {
	const partnerships = [
		{ src: gainzswap.src, alt: "gainzswap", width: 40, height: 40 },
		{ src: opencampus.src, alt: "opencampus", width: 150, height: 150 },
	];
	return (
		<Marquee
			autoFill
			speed={100}
			gradient
			gradientColor={"white"} // pure white, no opacity
			gradientWidth={100} // make it wider for subtle fade
		>
			<div className="py-3 flex my-5">
				{partnerships.map((partnership) => (
					<Image
						className="shrink-0 object-contain mx-3"
						src={partnership.src}
						width={partnership.width}
						height={partnership.height}
						alt={partnership.alt}
					/>
				))}
			</div>
		</Marquee>
	);
};

export default MarqueSection;
