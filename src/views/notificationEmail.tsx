import {
	Body,
	Container,
	Head,
	Hr,
	Html,
	Img,
	Preview,
	render,
	Text,
} from "@react-email/components";
import * as React from "react";

interface EmailProps {
	subject: string;
	message: string;
}

function Email(props: EmailProps): React.JSX.Element {
	const { subject, message } = props;

	return (
		<Html>
			<Head />
			<Preview>{subject}</Preview>
			<Body style={main}>
				<Container style={container}>
					{/* Hero Image */}
					<Img
						src={
							"https://res.cloudinary.com/dnfv0h10u/image/upload/v1726159919/image-2_det2dw.jpg"
						}
						width="400"
						height="50"
						alt="Hero Image"
						style={heroImage}
					/>
					{/* Subject as Main Heading */}
					<Text style={header}>{subject}</Text>
					{/* Second Image */}
					<Img
						src={
							"https://res.cloudinary.com/dnfv0h10u/image/upload/v1726159919/image-4_y5pcb8.jpg"
						}
						width="400"
						height="200"
						alt="Content Image"
						style={heroImage}
					/>
					{/* Message Section */}
					<Text style={paragraph}>Hi,</Text>
					<Text style={paragraph}>{message}</Text>
					<Text style={paragraph}>
						Best,
						<br />
						The M# Team
					</Text>
					<Hr style={hr} />
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

const hr = {
	borderColor: "#cccccc",
	margin: "20px 0",
};

export const emailHtml = async (
	subject: string,
	message: string,
): Promise<string> =>
	await render(<Email subject={subject} message={message} />);
