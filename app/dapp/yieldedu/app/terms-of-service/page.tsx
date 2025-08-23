"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function TermsOfServicePage() {
	return (
		<>
			<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none dark:block hidden bg-gradient-animated bg-400 animate-gradient">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#1a365d80,#0A0B1E)]"></div>
				<div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
				<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
			</div>
			<Header />
			<main className="space-y-6 container mx-auto p-5 md:max-w-5xl py-28">
				<section className="mb-8">
					<p className="mb-4 text-lime-500 dark:text-lime-400">
						<strong>Last Updated:</strong> March 11, 2025
					</p>
					<p className="mb-4">
						Welcome to YieldEdu Protocol. These Terms of Service
						(&quot;Terms&quot;) govern your use of the YieldEdu Protocol
						platform, website, and services (collectively, the
						&quot;Service&quot;). By accessing or using the Service, you agree
						to be bound by these Terms.
					</p>
					<p>
						If you do not agree to these Terms, please do not use our Service.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						1. Acceptance of Terms
					</h2>
					<p className="mb-4">
						By accessing or using the Service, you acknowledge that you have
						read, understood, and agree to be bound by these Terms, as well as
						our Privacy Policy.
					</p>
					<p>
						If you are using the Service on behalf of an organization, you
						represent and warrant that you have the authority to bind that
						organization to these Terms. In such cases, &quot;you&quot; and
						&quot;your&quot; will refer to both you and that organization.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						2. Eligibility
					</h2>
					<p className="mb-4">
						To use the Service, you must be at least 18 years old and capable of
						forming a binding contract with YieldEdu Protocol. By using the
						Service, you represent and warrant that you meet these requirements.
					</p>
					<p>
						Certain parts of the Service may be subject to additional age or
						other eligibility requirements, which will be stated where
						applicable.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						3. User Accounts
					</h2>
					<p className="mb-4">
						To access certain features of the Service, you must create an
						account. When you create an account, you agree to provide accurate,
						current, and complete information and to update this information to
						maintain its accuracy.
					</p>
					<p className="mb-4">
						You are responsible for maintaining the confidentiality of your
						account credentials and for all activities that occur under your
						account. You agree to notify us immediately of any unauthorized use
						of your account or any other breach of security.
					</p>
					<p>
						We reserve the right to disable any user account at any time,
						including if we believe you have violated these Terms.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						4. Educational Content and Staking
					</h2>
					<p className="mb-4">
						YieldEdu Protocol provides educational content about decentralized
						finance (DeFi) and opportunities to stake cryptocurrencies. We
						strive to provide accurate and up-to-date information, but we do not
						guarantee the accuracy, completeness, or usefulness of any content.
					</p>
					<p className="mb-4">
						<strong>Educational Content:</strong> The educational content on our
						platform is for informational purposes only and should not be
						construed as financial advice. You should always conduct your own
						research and consult with a professional financial advisor before
						making investment decisions.
					</p>
					<p>
						<strong>Staking:</strong> Staking cryptocurrencies through our
						platform involves financial risk. You acknowledge and agree that the
						value of cryptocurrencies can be volatile, and you may lose all or
						part of your investment. We do not guarantee any returns on staking
						activities.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						5. Intellectual Property Rights
					</h2>
					<p className="mb-4">
						The Service and its original content, features, and functionality
						are owned by YieldEdu Protocol and are protected by international
						copyright, trademark, patent, trade secret, and other intellectual
						property or proprietary rights laws.
					</p>
					<p className="mb-4">
						You may not copy, modify, distribute, sell, or lease any part of the
						Service without our prior written consent. You also may not reverse
						engineer or attempt to extract the source code of the Service,
						unless applicable laws prohibit these restrictions.
					</p>
					<p>
						If you provide any suggestions, ideas, feedback, or recommendations
						to us, we may use them without any obligation to compensate you.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						6. User Conduct
					</h2>
					<p className="mb-4">You agree not to use the Service:</p>
					<ul className="list-disc ml-6 space-y-2">
						<li>In any way that violates any applicable law or regulation.</li>
						<li>
							To impersonate any person or entity, or falsely state or otherwise
							misrepresent your affiliation with a person or entity.
						</li>
						<li>
							To engage in any conduct that restricts or inhibits anyone&apos;s
							use or enjoyment of the Service.
						</li>
						<li>
							To attempt to gain unauthorized access to any part of the Service,
							other accounts, or systems connected to the Service.
						</li>
						<li>
							To use any robot, spider, or other automated device to access the
							Service.
						</li>
						<li>To transmit any viruses, malware, or other harmful code.</li>
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						7. Limitation of Liability
					</h2>
					<p className="mb-4">
						To the maximum extent permitted by law, YieldEdu Protocol and its
						officers, directors, employees, and agents shall not be liable for
						any indirect, incidental, special, consequential, or punitive
						damages, including lost profits, arising out of or relating to your
						use of the Service.
					</p>
					<p>
						In no event shall our total liability to you for all claims arising
						from or related to the Service exceed the amount paid by you, if
						any, for accessing the Service during the twelve (12) months
						immediately preceding the event giving rise to the liability.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						8. Modifications to Terms
					</h2>
					<p>
						We reserve the right to modify these Terms at any time. When we make
						changes, we will update the &quot;Last Updated&quot; date at the top
						of these Terms and notify you through the Service. Your continued
						use of the Service after such changes constitutes your acceptance of
						the new Terms.
					</p>
				</section>
			</main>
			<Footer />
		</>
	);
}
