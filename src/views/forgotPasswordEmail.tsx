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
						src={"https://res.cloudinary.com/dnfv0h10u/image/upload/v1726159919/image-2_det2dw.jpg"}
						width="400"
						height="50"
						alt="Hero Image"
						style={heroImage}
					/>
					<Text style={header}>Welcome to M#</Text>
					<Img
						src={"https://res.cloudinary.com/dnfv0h10u/image/upload/v1726159919/image-4_y5pcb8.jpg"}
						width="400"
						height="200"
						alt="Hero Image"
						style={heroImage}
					/>
					<Text style={paragraph}>
						You requested to reset your password, click the button below to reset your password
						<br />
						Note : The link will expire after 1 day
					</Text>
					<Section style={btnContainer}>
						<Button style={buttonPrimary} href={url}>
							Reset password
						</Button>
					</Section>
					<Hr style={hr} />
					<Text style={footer}>
						If you have any questions, feel free to message us at{" "}
						<a href="mailto:manipal.hackathon@manipal.edu" style={link}>
							M# support email
						</a>
						.<br />
						M# Team
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
	backgroundColor: "#FF6D2D",
	borderRadius: "5px",
	color: "#ffffff",
	fontSize: "16px",
	textDecoration: "none",
	padding: "12px 24px",
	display: "inline-block",
};

// const buttonSecondary = {
//  backgroundColor: "#FF6D2D",
//  borderRadius: "5px",
//  color: "#ffffff",
//  fontSize: "16px",
//  textDecoration: "none",
//  padding: "12px 24px",
//  display: "inline-block",
// };

const footer = {
	fontSize: "12px",
	color: "#888888",
	lineHeight: "18px",
};

const link = {
	color: "#FF6D2D",
	textDecoration: "none",
};

const hr = {
	borderColor: "#cccccc",
	margin: "20px 0",
};

export const emailHtml = async (url: string): Promise<string> => {
	return await render(<Email url={url} />);
};