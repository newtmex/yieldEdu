import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components";

interface EmailProps {
	link: string;
}

const baseUrl = process.env.BETTER_AUTH_URL ?? "https://yieldedu.org";

export const EmailTemplate = ({ link }: EmailProps) => (
	<Html style={{ minHeight: "100vh" }}>
		<Head />
		<Body style={main}>
			<Preview>Click to sign in to your YieldEdu account</Preview>
			<Container style={container}>
				<Section style={sectionPadding}>
					<Img
						src={`${baseUrl}/yieldedu.png`}
						width={48}
						height={48}
						alt="YieldEdu Logo"
					/>
					<Heading style={heading}>🪄 Your magic link </Heading>
					<Section>
						<Text style={paragraph}>
							<Link
								target="_blank"
								style={{ ...linkStyle, display: "block", marginBottom: "16px" }}
								href={link}
							>
								👉 Click here to sign in 👈
							</Link>
						</Text>
						<Text style={paragraph}>
							If you didn't request this, please ignore this email.
						</Text>
					</Section>
					<Text>
						Best,
						<br />- YieldEdu Team
					</Text>
					<Hr style={hr} />
					<Img
						src={`${baseUrl}/yieldedu.png`}
						width={32}
						height={32}
						alt="YieldEdu Logo"
						style={{
							WebkitFilter: "grayscale(100%)",
							filter: "grayscale(100%)",
							margin: "20px 0",
						}}
					/>
					<Link
						href={baseUrl}
						target="_blank"
						style={{ ...linkStyle, color: "#898989" }}
					>
						<Text style={footer}>YieldEdu.</Text>
					</Link>
				</Section>
			</Container>
		</Body>
	</Html>
);

export default EmailTemplate;

const container = {
	margin: "0 auto",
	height: "100%",
};

const sectionPadding = {
	padding: "20px", // this is the fix
};

const main = {
	background: "linear-gradient(to bottom, #fdf6e3 0%, #f5e0dc 100%)",
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const linkStyle = {
	color: "#2754C5",
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: "14px",
	textDecoration: "underline",
};

const heading = { fontSize: "28px", fontWeight: "bold", marginTop: "48px" };

const paragraph = {
	fontSize: "16px",
	lineHeight: "26px",
};

const footer = {
	color: "#898989",
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: "12px",
	lineHeight: "22px",
	marginTop: "12px",
	marginBottom: "24px",
};

const hr = {
	borderColor: "#dddddd",
	marginTop: "48px",
};
