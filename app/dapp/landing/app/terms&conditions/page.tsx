"use client";

import Footer from "@/components/footer";
import Navigation from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

interface Term {
	id: string;
	title: string;
	content: string;
	bullet_points?: string;
}
const Page = () => {
	const [terms, setTerms] = useState<Term[]>([]);
	const [lastUpdatedAt, setLastUpdatedAt] = useState<string>("");
	const [isPending, setIsPending] = useState<boolean>(true);
	const [isError, setIsError] = useState<string>("");

	useEffect(() => {
		setIsPending(true);

		const fetchTerms = async () => {
			const supabase = createClient(
				process.env.NEXT_PUBLIC_SUPABASE_URL!,
				process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
			);

			try {
				let { data: termsData, error } = await supabase
					.from("terms")
					.select("*");

				if (error) {
					console.error("Error fetching terms:", error);
					throw error;
				} else {
					setTerms(termsData as Term[]);

					if (termsData && termsData.length > 0) {
						const latest = termsData.reduce((latest, current) =>
							new Date(current.last_updated_at) >
							new Date(latest.last_updated_at)
								? current
								: latest
						);
						setLastUpdatedAt(latest.last_updated_at);
					}
				}
			} catch (error) {
				console.error("Error fetching terms:", error);
				setIsError(
					"Failed to load terms and conditions. Please try again later."
				);
			} finally {
				setIsPending(false);
			}
		};

		fetchTerms();
	}, []);

	return (
		<>
			<Navigation />
			<div className="min-h-screen bg-black pt-10 text-white">
				{isError ? (
					<div className="flex flex-col items-center justify-center min-h-[300px]">
						<span className="text-red-400 font-semibold mb-2">{isError}</span>
						<Button onClick={() => window.location.reload()}>Retry</Button>
					</div>
				) : isPending ? (
					<div className="flex justify-center items-center min-h-[300px]">
						<span className="text-white text-lg">
							Loading Terms and Conditions...
						</span>
					</div>
				) : (
					<div className="container mx-auto px-6 py-24 max-w-4xl">
						{/* Header */}
						<div className="mb-16">
							<h1 className="text-3xl md:text-5xl font-bold mb-4 text-white">
								Terms & Conditions
							</h1>
							{lastUpdatedAt && (
								<p className="text-gray-400 text-base">
									Updated at:{" "}
									<span className="text-lime-400">
										{new Date(lastUpdatedAt).toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</span>
								</p>
							)}
						</div>

						<div className="space-y-16">
							{terms.map((term) => (
								<section key={term.id}>
									<h2 className="text-2xl font-medium text-white mb-3">
										{term.title}
									</h2>
									<p className="text-gray-300 leading-relaxed">
										{term.content}
									</p>
									{term?.bullet_points && (
										<ul className="list-disc list-inside mt-4 space-y-2">
											{term?.bullet_points.split(";").map((point, index) => (
												<li key={index} className="text-gray-300">
													{point}
												</li>
											))}
										</ul>
									)}
								</section>
							))}
						</div>
					</div>
				)}
				<Footer className="hover:text-white" />
			</div>
		</>
	);
};

export default Page;
