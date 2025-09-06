"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import YieldEDUIcon from "@/public/icon2.png";
import Link from "next/link";
import MobileHeader from "@/components/MobileHeader";
import Feedback from "./Feedback";
// import OCIDLoginButton from "@/components/OCIDLoginButton";

const Header = () => {
	const { theme, setTheme } = useTheme();
	const [toggleMobileMenu, setToggleMobileMenu] = useState(false);

	return (
		<>
			<header className="fixed w-full z-30 top-0 border-b border-slate-200 dark:border-slate-800/60 backdrop-blur-md bg-white/80 dark:bg-slate-900/80">
				<div className="container mx-auto px-4 py-2`">
					<div className="flex justify-between items-center">
						<Link href={"/"} className="flex items-center gap-3">
							<Image
								src={YieldEDUIcon}
								alt="YieldEdu Logo"
								className="size-14 aspect-square"
							/>
							<div>
								<h1 className="text-lg md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-lime-500 to-yellow-500">
									YieldEdu
								</h1>
								<p className="text-sm text-slate-500 dark:text-slate-400">
									Learn & Earn Protocol
								</p>
							</div>
						</Link>
						<div className="hidden md:flex items-center gap-4">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
								className="text-slate-600 dark:text-slate-300 hover:text-lime-500 hover:bg-lime-500/10"
							>
								<Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
								<Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
								<span className="sr-only">Toggle theme</span>
							</Button>

							<nav className="flex items-center text-sm gap-6">
								<a
									href="/about-us"
									className="text-slate-600 dark:text-slate-300 hover:text-lime-500 dark:hover:text-lime-500 transition-colors"
								>
									About
								</a>
								<a
									href="/features"
									className="text-slate-600 dark:text-slate-300 hover:text-lime-500 dark:hover:text-lime-500 transition-colors"
								>
									Features
								</a>
								<a
									href="/blogs"
									className="text-slate-600 dark:text-slate-300 hover:text-lime-500 dark:hover:text-lime-500 transition-colors"
								>
									Blogs
								</a>
								<a
									href="/contact-support"
									className="text-slate-600 dark:text-slate-300 hover:text-lime-500 dark:hover:text-lime-500 transition-colors"
								>
									Support
								</a>
							</nav>
							<Feedback>
								<Button
									className="hover:bg-transparent border-none bg-transparent text-slate-600 font-semibold dark:text-white hover:text-lime-500 dark:hover:text-lime-500"
									variant="outline"
								>
									Feedback
								</Button>
							</Feedback>
							<Link href="/dashboard" target="_blank">
								<Button
									className=" bg-lime-400 hover:bg-lime-400 dark:hover:bg-lime-400/80 text-gray-900 hover:text-slate-900 font-semibold transition-colors"
									variant="outline"
								>
									Launch App
								</Button>
							</Link>
						</div>
						<Button
							type="button"
							className="md:hidden"
							onClick={() => setToggleMobileMenu(true)}
						>
							<Menu />
						</Button>
					</div>
				</div>
			</header>
			<MobileHeader
				setToggleMobileMenu={setToggleMobileMenu}
				toggleMobileMenu={toggleMobileMenu}
				setTheme={setTheme}
				theme={theme}
			/>
		</>
	);
};

export default Header;
