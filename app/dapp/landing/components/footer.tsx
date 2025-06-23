"use client";
import { IconBrandTelegram, IconBrandX } from "@tabler/icons-react";
import { animate, motion, useMotionValue } from "framer-motion";
import React from "react";
import Link from "next/link";
import { ClassValue } from "clsx";
import { cn } from "@/lib/utils";

const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

const Footer = ({ className }: { className?: ClassValue }) => {
	const defaultLegalLinks = [
		{ name: "Terms and Conditions", href: "/terms&conditions" },
		{ name: "Privacy Policy", href: "/privacy-policy" },
	];

	const defaultSocialLinks = [
		{
			icon: <IconBrandTelegram className="size-5" />,
			href: process.env.NEXT_PUBLIC_TELEGRAM_URL!,
			label: "Telegram",
		},
		{
			icon: <IconBrandX className="size-5" />,
			href: process.env.NEXT_PUBLIC_TWITTER_URL!,
			label: "Twitter",
		},
	];

	const defaultSections = [
		{
			title: "Platform",
			links: [
				{ name: "Features", href: "/features" },
				{ name: "About", href: "/about" },
				{ name: "Support", href: "/support" },
			],
		},
		{
			title: "Resources",
			links: [
				{ name: "Community", href: process.env.NEXT_PUBLIC_TELEGRAM_URL! },
			],
		},
	];

	const color = useMotionValue(COLORS_TOP[0]);

	React.useEffect(() => {
		animate(color, COLORS_TOP, {
			ease: "easeInOut",
			duration: 10,
			repeat: Number.POSITIVE_INFINITY,
			repeatType: "mirror",
		});
	}, []);

	return (
		<section className={cn("container p-6 xl:px-12")}>
			<div className="container mx-auto">
				<div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
					<div className="flex w-full flex-col justify-between gap-6 lg:items-start">
						{/* Logo */}
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
						<p className="max-w-[70%] text-sm text-muted-foreground">
							transforming education into a transparent, on-chain experience
							where learners grow and investors track real impact.
						</p>
						<ul className="flex items-center space-x-6 text-muted-foreground">
							{defaultSocialLinks.map((social, idx) => (
								<li
									key={idx}
									className={cn("font-medium hover:text-primary", className)}
								>
									<Link
										target="_blank"
										href={social.href}
										aria-label={social.label}
									>
										{social.icon}
									</Link>
								</li>
							))}
						</ul>
					</div>
					<div className="grid w-full gap-6 md:grid-cols-3 lg:gap-20">
						{defaultSections.map((section, sectionIdx) => (
							<div key={sectionIdx}>
								<h3 className="mb-4 font-bold">{section.title}</h3>
								<ul className="space-y-3 text-sm text-muted-foreground">
									{section.links.map((link, linkIdx) => (
										<li
											key={linkIdx}
											className={cn(
												"font-medium hover:text-primary",
												className
											)}
										>
											<a href={link.href}>{link.name}</a>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>
				<div className="mt-8 flex flex-col justify-between gap-4 border-t py-8 text-xs font-medium text-muted-foreground md:flex-row md:items-center md:text-left">
					<p className="order-2 lg:order-1">{`© ${new Date().getFullYear()}. ${
						process.env.NEXT_PUBLIC_WEBSITE_URL
					} All rights reserved.`}</p>
					<ul className="order-1 flex flex-col gap-2 md:order-2 md:flex-row">
						{defaultLegalLinks.map((link, idx) => (
							<li key={idx} className={cn("hover:text-primary", className)}>
								<a href={link.href}> {link.name}</a>
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
};

export default Footer;
