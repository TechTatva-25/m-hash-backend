/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as aws from "@aws-sdk/client-ses";
import dotenv from "dotenv";
import SMTPTransport from "nodemailer";

import { emailHtml as forgotPasswordEmailHtml } from "../views/forgotPasswordEmail";
import { emailHtml as notificationEmailHtml } from "../views/notificationEmail";
import { emailHtml as verifyEmailHtml } from "../views/registerEmail";

dotenv.config();

export enum SignType {
	VERIFICATION = "verification",
	FORGOT_PASSWORD = "forgot",
	NOTIFICATION = "notification",
}

const ses = new aws.SES({
	region: process.env.SES_REGION!,
	credentials: {
		accessKeyId: process.env.SES_ACCESS_KEY!,
		secretAccessKey: process.env.SES_SECRET_KEY!,
	},
});

// export const transporter = SMTPTransport.createTransport({
// 	service: process.env.EMAIL_SERVICE ?? "gmail",
// 	host: process.env.EMAIL_HOST ?? "smtp.gmail.com",
// 	port: parseInt(process.env.EMAIL_PORT ?? "465"),
// 	secure: true,
// 	auth: {
// 		user: process.env.EMAIL_USER,
// 		pass: process.env.EMAIL_PASS,
// 	},
// });

export const transporter = SMTPTransport.createTransport({
	SES: { ses, aws },
});

export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
	const url = `${process.env.CLIENT_URL ?? "http://localhost:3000"}/verify-email?token=${token}`;
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject: "Email verification",
		html: await verifyEmailHtml(url),
	};
	await transporter.sendMail(mailOptions);
};

export const sendForgotPasswordEmail = async (email: string, token: string): Promise<void> => {
	const url = `${process.env.CLIENT_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject: "Reset password",
		html: await forgotPasswordEmailHtml(url),
	};
	await transporter.sendMail(mailOptions);
};

export const sendNotificationEmail = async (email: string, subject: string, message: string): Promise<void> => {
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject: "Notification",
		html: await notificationEmailHtml(subject, message),
	};
	await transporter.sendMail(mailOptions);
};