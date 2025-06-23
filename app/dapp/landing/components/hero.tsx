"use client";

import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
// import { FiArrowRight } from "react-icons/fi"
import {
	useMotionTemplate,
	useMotionValue,
	motion,
	animate,
} from "framer-motion";
import { Badge } from "./ui/badge";
import { PlasticButton } from "./plastic-button";
import Link from "next/link";

const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

export const Hero = () => {
	const color = useMotionValue(COLORS_TOP[0]);

	useEffect(() => {
		animate(color, COLORS_TOP, {
			ease: "easeInOut",
			duration: 10,
			repeat: Number.POSITIVE_INFINITY,
			repeatType: "mirror",
		});
	}, []);

	const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})`;
	const border = useMotionTemplate`1px solid ${color}`;
	const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

	return (
		<motion.section
			style={{
				backgroundImage,
			}}
			className="relative grid min-h-screen place-content-center overflow-hidden bg-gray-950 px-4 py-24 text-gray-200"
		>
			<div className="relative flex flex-col items-center">
				<h1 className="max-w-3xl bg-gradient-to-br from-white to-gray-400 bg-clip-text text-center text-4xl font-medium leading-tight text-transparent sm:text-6xl sm:leading-tight md:text-7xl">
					The Future of On-Chain Education
				</h1>
				<p className="my-6 max-w-xl text-center text-base leading-relaxed md:text-lg md:leading-relaxed">
					YieldEdu transforms education into a transparent, on-chain
					experience—where learners grow through verified progress and investors
					track real impact.
				</p>
				<div className="flex gap-5 relative">
					<motion.button
						disabled
						style={{
							border,
							boxShadow,
						}}
						whileHover={{
							scale: 1.015,
						}}
						whileTap={{
							scale: 0.985,
						}}
						className="group disabled:opacity-20 relative flex w-fit items-center gap-1.5 rounded-full z-20 cursor-pointer px-7 py-2 text-gray-50 transition-colors bg-gray-950/50"
					>
						Start Learning
					</motion.button>
					<Link
						target="_blank"
						href={process.env.NEXT_PUBLIC_INVESTORS_DASHBOARD_URL!}
					>
						<PlasticButton text="Launch App" className="z-30" />
					</Link>
				</div>
			</div>

			<div className="absolute inset-0 z-0">
				<Canvas>
					<Stars radius={50} count={2500} factor={4} fade speed={2} />
				</Canvas>
			</div>
		</motion.section>
	);
};
