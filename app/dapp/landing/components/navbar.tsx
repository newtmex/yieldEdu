"use client";

import * as React from "react";
import { useState } from "react";
import {
	motion,
	AnimatePresence,
	useMotionValue,
	animate,
	useMotionTemplate,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import { PlasticButton } from "./plastic-button";
import Link from "next/link";

const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

const Navigation = () => {
	const [isOpen, setIsOpen] = useState(false);

	const toggleMenu = () => setIsOpen(!isOpen);

	const color = useMotionValue(COLORS_TOP[0]);

	React.useEffect(() => {
		animate(color, COLORS_TOP, {
			ease: "easeInOut",
			duration: 10,
			repeat: Number.POSITIVE_INFINITY,
			repeatType: "mirror",
		});
	}, []);

	const backgroundImage = useMotionTemplate`radial-gradient(120% 120% at 50% 0%, rgba(2,6,23,0.7) 60%, ${color} 100%)`;

	const navLinks = ["About", "Features", "Support"];

	return (
		<div className="fixed top-5 left-0 right-0 z-50">
			<div className="flex text-white/80 justify-center w-full sticky top-3 px-4">
				<motion.div className="flex items-center justify-between px-6 py-3 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl  w-full max-w-3xl relative z-10 shadow-2xl shadow-black/25">
					<div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/5 to-transparent rounded-full pointer-events-none" />

					<motion.div
						style={{
							backgroundImage,
						}}
						className="absolute inset-4 rounded-full blur-lg -z-10"
					/>
					<motion.div
						className="flex items-center gap-2 font-bold"
						style={{
							color,
							textShadow: "0 1px 8px rgba(0,0,0,0.15), 0 0px 1px #000",
						}}
					>
						<motion.div
							className="w-8 h-8"
							initial={{ scale: 0.8 }}
							animate={{ scale: 1 }}
							whileHover={{ rotate: 10 }}
							transition={{ duration: 0.3 }}
						>
							<Link href={"/"}>
								<svg
									height={32}
									viewBox="0 0 400 464"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<motion.path
										d="M200 217V100.5L76.5 158L200 217Z"
										fill={color}
									/>
									<motion.path
										d="M106.5 261.5V187.5L200 232C200.5 265.167 201.1 330.3 199.5 325.5C197.5 319.5 189.065 299.333 164.5 278C145.5 261.5 118 259.5 106.5 261.5Z"
										fill={color}
									/>
									<motion.path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M0 263.5V0H195H198.5H399.5C399.863 46.8802 399.699 133.954 399.581 195.85L399.581 195.904C399.537 219.144 399.5 238.83 399.5 251.5C399.5 301.3 380.155 321.857 366.643 336.215L366.636 336.222C365.906 336.998 365.192 337.756 364.5 338.5L200.5 464C184.867 452.128 160.418 433.749 134.654 414.383C102.187 389.978 67.6329 364.004 46 347.5C7.19999 317.9 -1.03339e-05 281 0 263.5ZM378 20.5H198.5H195H21V245.5C21 294.254 38.8206 312.851 48.2527 322.694L48.2567 322.698C48.6896 323.15 49.1049 323.583 49.5 324L200.5 438C223.333 420.333 279.2 377.3 320 346.5C366.5 314 374 293.5 378 267.5V20.5Z"
										fill={color}
									/>
									<motion.path
										d="M200.5 35V99L324 157L200.5 216.5V230L292 184.5V262C277.5 258 248 263.5 224.5 286C201.56 307.964 200.5 322 200.5 325.5V421.5L337 318C346.167 311.167 364.5 287.7 364.5 248.5V35H200.5Z"
										fill={color}
									/>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M378 20.5H198.5H195H21V245.5C21 294.254 38.8206 312.851 48.2527 322.694L48.2567 322.698C48.6896 323.15 49.1049 323.583 49.5 324L200.5 438C223.333 420.333 279.2 377.3 320 346.5C366.5 314 374 293.5 378 267.5V20.5ZM200.5 99V35H364.5V248.5C364.5 287.7 346.167 311.167 337 318L200.5 421.5V325.5C200.5 322 201.56 307.964 224.5 286C248 263.5 277.5 258 292 262V184.5L200.5 230V216.5L324 157L200.5 99ZM200 217V100.5L76.5 158L200 217ZM106.5 261.5V187.5L200 232C200.5 265.167 201.1 330.3 199.5 325.5C197.5 319.5 189.065 299.333 164.5 278C145.5 261.5 118 259.5 106.5 261.5Z"
										fill="#0F161D"
									/>
								</svg>
							</Link>
						</motion.div>
						YieldEDU
					</motion.div>

					{/* Desktop Navigation */}
					<nav className="hidden  md:flex items-center space-x-8">
						{navLinks.map((item) => (
							<motion.div
								key={item}
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3 }}
								whileHover={{ scale: 1.05 }}
							>
								<Link
									href={`/${item.toLowerCase()}`}
									className="text-xs uppercase hover:text-white transition-colors font-medium"
								>
									{item}
								</Link>
							</motion.div>
						))}
					</nav>

					{/* Desktop CTA Button */}
					<motion.div
						className="hidden md:block"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3, delay: 0.2 }}
						whileHover={{ scale: 1.05 }}
					>
						<PlasticButton text="Launch App" />
					</motion.div>

					{/* Mobile Menu Button */}
					<motion.button
						className="md:hidden flex items-center"
						onClick={toggleMenu}
						whileTap={{ scale: 0.9 }}
					>
						<Menu className="h-6 w-6 text-white" />
					</motion.button>
				</motion.div>

				{/* Mobile Menu Overlay */}
				<AnimatePresence>
					{isOpen && (
						<motion.div
							className="fixed inset-0 bg-white z-50 pt-24 px-6 md:hidden"
							initial={{ opacity: 0, x: "100%" }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: "100%" }}
							transition={{ type: "spring", damping: 25, stiffness: 300 }}
						>
							<motion.button
								className="absolute top-6 right-6 p-2"
								onClick={toggleMenu}
								whileTap={{ scale: 0.9 }}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.2 }}
							>
								<X className="h-6 w-6 text-gray-900" />
							</motion.button>
							<div className="flex flex-col space-y-6">
								{navLinks.map((item, i) => (
									<motion.div
										key={item}
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: i * 0.1 + 0.1 }}
										exit={{ opacity: 0, x: 20 }}
									>
										<Link
											href={`/${item.toLowerCase()}`}
											className="text-base text-gray-900 font-medium"
											onClick={toggleMenu}
										>
											{item}
										</Link>
									</motion.div>
								))}

								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.5 }}
									exit={{ opacity: 0, y: 20 }}
									className="pt-6"
								>
									<PlasticButton text="Launch App" />
								</motion.div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};

export default Navigation;
