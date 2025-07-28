/* eslint-disable @typescript-eslint/no-non-null-assertion */
//import * as aws from "@aws-sdk/client-ses";
import dotenv from "dotenv";
import SMTPTransport from "nodemailer";

import { emailHtml as forgotPasswordEmailHtml } from "../views/forgotPasswordEmail";
import { emailHtml as notificationEmailHtml } from "../views/notificationEmail";
import { emailHtml as verifyEmailHtml } from "../views/registerEmail";
import bcrypt from "bcrypt";
import user from "../models/User/user";
dotenv.config();

export enum SignType {
	VERIFICATION = "verification",
	FORGOT_PASSWORD = "forgot",
	NOTIFICATION = "notification",
}

// const ses = new aws.SES({
// 	region: process.env.SES_REGION!,
// 	credentials: {
// 		accessKeyId: process.env.SES_ACCESS_KEY!,
// 		secretAccessKey: process.env.SES_SECRET_KEY!,
// 	},
// });

export const transporter = SMTPTransport.createTransport({
	service: process.env.EMAIL_SERVICE ?? "gmail",
	host: process.env.EMAIL_HOST ?? "smtp.gmail.com",
	port: parseInt(process.env.EMAIL_PORT ?? "465"),
	secure: true,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

// //Use belowe if u have SES
// export const transporter = SMTPTransport.createTransport({
// 	SES: { ses, aws },
// });

// export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
// 	const url = `${process.env.CLIENT_URL ?? "http://localhost:3000"}/verify-email?token=${token}`;
// 	const mailOptions = {
// 		from: process.env.EMAIL_USER,
// 		to: email,
// 		subject: "Email verification",
// 		html: await verifyEmailHtml(url),
// 	};
// 	await transporter.sendMail(mailOptions);
// };

export const sendOTPVerificationEmail = async (
	email: string,
	_id: string,
): Promise<void> => {
	try {
		// Generate a 4-digit OTP
		const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

		// Hash the OTP for secure storage
		const saltRounds = 10;
		const hashedOTP = await bcrypt.hash(otp, saltRounds);

		// Set OTP and expiry (10 mins from now)
		const result = await user.findByIdAndUpdate(_id, {
			otp: hashedOTP,
			otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
		});

		if (!result) {
			throw new Error("User not found");
		}

		// Send email with the plain text OTP
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: email,
			subject: "Email Verification",
			html: await verifyEmailHtml(otp),
		};

		await transporter.sendMail(mailOptions);
	} catch (error) {
		console.error("Error sending OTP email:", error);
		throw new Error("Failed to send OTP");
	}
};

export const sendForgotPasswordEmail = async (
	email: string,
	token: string,
): Promise<void> => {
	const url = `${process.env.CLIENT_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject: "Reset password",
		html: await forgotPasswordEmailHtml(url),
	};
	await transporter.sendMail(mailOptions);
};

export const sendNotificationEmail = async (
	email: string,
	subject: string,
	message: string,
): Promise<void> => {
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject: "Notification",
		html: await notificationEmailHtml(subject, message),
	};
	await transporter.sendMail(mailOptions);
};
