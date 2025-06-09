"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function PrivacyPolicyPage() {
	return (
		<>
			<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none dark:block hidden bg-gradient-animated bg-400 animate-gradient">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#1a365d80,#0A0B1E)]"></div>
				<div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
				<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
			</div>
			<Header />
			<main className="space-y-6 py-28 px-5 mx-auto container md:max-w-5xl">
				<section className="mb-8">
					<p className="mb-4 text-lime-500 dark:text-lime-400">
						<strong>Last Updated:</strong> March 11, 2025
					</p>
					<p className="mb-4">
						Welcome to YieldEdu Protocol&apos;s Privacy Policy. This document
						explains how we collect, use, and protect your personal information
						when you use our platform.
					</p>
					<p>
						We take your privacy seriously and are committed to maintaining the
						trust and confidence of our users.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						Information We Collect
					</h2>
					<p className="mb-4">We collect the following types of information:</p>
					<ul className="list-disc ml-6 space-y-2">
						<li>
							<strong>Account Information:</strong> When you create an account,
							we collect your name, email address, and chosen password.
						</li>
						<li>
							<strong>Profile Information:</strong> Additional details you
							choose to add to your profile, such as educational background,
							areas of interest, or profile pictures.
						</li>
						<li>
							<strong>Authentication Data:</strong> Information received through
							OCID (OpenID Connect) authentication, including your unique
							identifier and basic profile details.
						</li>
						<li>
							<strong>Wallet Information:</strong> Public wallet addresses you
							connect to the platform for staking and rewards.
						</li>
						<li>
							<strong>Platform Activity:</strong> Information about your
							interactions with our platform, including courses completed,
							staking activities, and rewards earned.
						</li>
						<li>
							<strong>Technical Data:</strong> Information about your device,
							browser, IP address, and how you interact with our platform.
						</li>
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						How We Use Your Information
					</h2>
					<p className="mb-4">
						We use your information for the following purposes:
					</p>
					<ul className="list-disc ml-6 space-y-2">
						<li>
							To provide and maintain our services, including processing
							transactions and delivering educational content.
						</li>
						<li>To improve and personalize your experience on our platform.</li>
						<li>
							To calculate and distribute rewards based on your learning
							achievements and staking activities.
						</li>
						<li>
							To communicate with you about platform updates, security alerts,
							and support messages.
						</li>
						<li>To prevent fraud and ensure the security of our platform.</li>
						<li>
							To comply with legal obligations and enforce our terms of service.
						</li>
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						Data Sharing and Disclosure
					</h2>
					<p className="mb-4">We may share your information with:</p>
					<ul className="list-disc ml-6 space-y-2">
						<li>
							<strong>Service Providers:</strong> Third-party vendors who help
							us operate our platform, process payments, and provide customer
							support.
						</li>
						<li>
							<strong>Educators:</strong> If you&apos;re a student, certain
							information may be shared with educators of courses you enroll in.
						</li>
						<li>
							<strong>Legal Requirements:</strong> We may disclose information
							if required by law, legal process, or government request.
						</li>
					</ul>
					<p className="mt-4">
						We do not sell your personal information to third parties.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						Your Rights and Choices
					</h2>
					<p className="mb-4">
						Depending on your location, you may have the following rights:
					</p>
					<ul className="list-disc ml-6 space-y-2">
						<li>Access and receive a copy of your personal data.</li>
						<li>Correct inaccurate personal information.</li>
						<li>Request deletion of your personal data.</li>
						<li>Object to processing of your personal data.</li>
						<li>Data portability.</li>
						<li>Withdraw consent where processing is based on consent.</li>
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						Data Security
					</h2>
					<p className="mb-4">
						We implement appropriate technical and organizational measures to
						protect your personal information against unauthorized access,
						accidental loss, or destruction.
					</p>
					<p>
						However, please be aware that no method of transmission over the
						internet or electronic storage is 100% secure. While we strive to
						use commercially acceptable means to protect your personal
						information, we cannot guarantee its absolute security.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						Changes to This Privacy Policy
					</h2>
					<p>
						We may update this privacy policy from time to time. We will notify
						you of any changes by posting the new privacy policy on this page
						and updating the &quot;Last Updated&quot; date. You are advised to
						review this privacy policy periodically for any changes.
					</p>
				</section>
			</main>
			<Footer />
		</>
	);
}
