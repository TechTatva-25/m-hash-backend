import SMTPTransport from "nodemailer";
export declare enum SignType {
    VERIFICATION = "verification",
    FORGOT_PASSWORD = "forgot",
    NOTIFICATION = "notification"
}
export declare const transporter: SMTPTransport.Transporter<import("nodemailer/lib/smtp-transport").SentMessageInfo, import("nodemailer/lib/smtp-transport").Options>;
export declare const sendOTPVerificationEmail: (email: string, _id: string) => Promise<void>;
export declare const sendForgotPasswordEmail: (email: string, token: string) => Promise<void>;
export declare const sendNotificationEmail: (email: string, subject: string, message: string) => Promise<void>;
