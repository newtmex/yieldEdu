import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function CookiePolicyPage() {
	return (
		<>
			<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none dark:block hidden bg-gradient-animated bg-400 animate-gradient">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#1a365d80,#0A0B1E)]"></div>
				<div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
				<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
			</div>
			<Header />
			<main className="space-y-6 container py-28 mx-auto md:max-w-5xl p-5">
				<section className="mb-8">
					<p className="mb-4 text-lime-500 dark:text-lime-400">
						<strong>Last Updated:</strong> March 11, 2025
					</p>
					<p className="mb-4">
						This Cookie Policy explains how YieldEdu Protocol (&quot;we&quot;,
						&quot;us&quot;, or &quot;our&quot;) uses cookies and similar
						technologies when you visit our website or use our platform.
					</p>
					<p>
						By using our platform, you consent to the use of cookies as
						described in this policy.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						What Are Cookies?
					</h2>
					<p className="mb-4">
						Cookies are small text files that are stored on your device
						(computer, tablet, or mobile) when you visit a website. They are
						widely used to make websites work more efficiently, provide a better
						user experience, and give website owners information about how users
						interact with their site.
					</p>
					<p>
						Cookies are not harmful and do not contain any personal information
						like your email address or payment details. They simply help
						websites remember your preferences and provide a more personalized
						experience.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						Types of Cookies We Use
					</h2>
					<p className="mb-4">We use the following types of cookies:</p>

					<h3 className="text-xl font-semibold mb-2 text-lime-500 dark:text-lime-400">
						Essential Cookies
					</h3>
					<p className="mb-4">
						These cookies are necessary for the website to function properly.
						They enable basic functions like page navigation, secure areas of
						the website, and access to certain features. The website cannot
						function properly without these cookies.
					</p>

					<h3 className="text-xl font-semibold mb-2 text-lime-500 dark:text-lime-400">
						Functional Cookies
					</h3>
					<p className="mb-4">
						These cookies enable us to provide enhanced functionality and
						personalization. They may be set by us or by third-party providers
						whose services we have added to our pages. If you do not allow these
						cookies, some or all of these services may not function properly.
					</p>

					<h3 className="text-xl font-semibold mb-2 text-lime-500 dark:text-lime-400">
						Performance Cookies
					</h3>
					<p className="mb-4">
						These cookies collect information about how you use our website,
						such as which pages you visit most often and if you experience any
						errors. They help us improve how our website works and understand
						user behavior.
					</p>

					<h3 className="text-xl font-semibold mb-2 text-lime-500 dark:text-lime-400">
						Targeting/Advertising Cookies
					</h3>
					<p>
						These cookies may be set through our site by our advertising
						partners. They may be used by those companies to build a profile of
						your interests and show you relevant advertisements on other sites.
						They do not store directly personal information but are based on
						uniquely identifying your browser and internet device.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						How We Use Cookies
					</h2>
					<p className="mb-4">
						We use cookies for various purposes, including:
					</p>
					<ul className="list-disc ml-6 space-y-2">
						<li>Authenticating users and maintaining session information</li>
						<li>Storing user preferences and settings</li>
						<li>Monitoring platform performance and usage patterns</li>
						<li>Providing personalized content and recommendations</li>
						<li>Improving our platform based on how users interact with it</li>
						<li>Protecting the security and integrity of our services</li>
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						Third-Party Cookies
					</h2>
					<p className="mb-4">
						Some cookies are placed by third parties on our behalf. These third
						parties may include analytics providers, advertising networks, and
						social media platforms. These third parties may use cookies, web
						beacons, and similar technologies to collect information about your
						use of our platform and other websites.
					</p>
					<p>
						We do not control the placement of cookies by third parties, and
						their use is subject to their own privacy policies.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						Managing Cookies
					</h2>
					<p className="mb-4">
						Most web browsers allow you to manage your cookie preferences. You
						can set your browser to refuse cookies, or to alert you when cookies
						are being sent. The methods for doing so vary from browser to
						browser, and from version to version.
					</p>
					<p className="mb-4">
						You can generally find information on how to manage cookie settings
						on your browser in the &quot;Help&quot; section or in the
						browser&apos;s settings.
					</p>
					<p>
						Please note that if you choose to block or delete cookies, you may
						not be able to access certain areas or features of our platform, and
						some services may not function properly.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						Changes to This Cookie Policy
					</h2>
					<p>
						We may update this Cookie Policy from time to time to reflect
						changes in technology, regulation, or our business practices. Any
						changes will become effective when we post the revised policy on
						this page. We encourage you to review this policy periodically to
						stay informed about our use of cookies.
					</p>
				</section>
			</main>
			<Footer />
		</>
	);
}
