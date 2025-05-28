import { Body, Button, Container, Head, Hr, Html, Img, Preview, render, Section, Text } from "@react-email/components";
import * as React from "react";

interface EmailProps {
	url: string;
}

function Email(props: EmailProps): React.JSX.Element {
	const { url } = props;

	return (
		<Html>
			<Head />
			<Preview>Verify your account by clicking the button below</Preview>
			<Body style={main}>
				<Container style={container}>
					<Img
						src="https://res.cloudinary.com/dnfv0h10u/image/upload/v1726159919/image-2_det2dw.jpg"
						width="400"
						height="50"
						alt="Hero Image"
						style={heroImage}
					/>
					<Text style={header}>Welcome to Manipal Hackathon</Text>
					<Img
						src="https://res.cloudinary.com/dnfv0h10u/image/upload/v1726159919/image-4_y5pcb8.jpg"
						width="400"
						height="200"
						alt="Hero Image"
						style={heroImage}
					/>
					<Text style={paragraph}>
						Greetings, <br />
						Kindly verify your account by clicking the button below. The link will expire in 24 hours,
						verify now!
					</Text>
					<Section style={btnContainer}>
						<Button style={buttonPrimary} href={url}>
							CLICK HERE
						</Button>
					</Section>
					<Text style={paragraph}>In case the link expires, click resend mail.</Text>
					<Section style={btnContainer}>
						<Button style={buttonSecondary} href={`${process.env.CLIENT_URL ?? ""}/verify-email`}>
							RESEND MAIL
						</Button>
					</Section>
					<Hr style={hr} />
					<Text style={footer}>
						If you have any questions, feel free to message us at{" "}
						<a href="mailto:manipal.hackathon@manipal.edu" style={footerLink}>
							Manipal Hackathon support email
						</a>
						.
						<br />
						Manipal Hackathon Team
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

const main = {
	backgroundColor: "#ffffff",
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
	margin: "0 auto",
	padding: "20px 20px 48px",
	textAlign: "center" as const,
	maxWidth: "600px",
};

const heroImage = {
	margin: "0 auto 20px",
};

const header = {
	fontSize: "24px",
	fontWeight: "bold" as const,
	marginBottom: "20px",
};

const paragraph = {
	fontSize: "16px",
	lineHeight: "26px",
	marginBottom: "20px",
};

const btnContainer = {
	textAlign: "center" as const,
	margin: "20px 0",
};

const buttonPrimary = {
	backgroundColor: "#ff6d2d",
	borderRadius: "5px",
	color: "#ffffff",
	fontSize: "16px",
	textDecoration: "none",
	padding: "12px 24px",
	display: "inline-block" as const,
};

const buttonSecondary = {
	backgroundColor: "#ff6d2d",
	borderRadius: "5px",
	color: "#ffffff",
	fontSize: "16px",
	textDecoration: "none",
	padding: "12px 24px",
	display: "inline-block" as const,
};

const hr = {
	borderColor: "#cccccc",
	margin: "20px 0",
};

const footer = {
	fontSize: "12px",
	color: "#888888",
	lineHeight: "18px",
};

const footerLink = {
	color: "#ff6d2d",
	textDecoration: "none",
};

export const emailHtml = async (url: string): Promise<string> => {
	return await render(<Email url={url} />);
};