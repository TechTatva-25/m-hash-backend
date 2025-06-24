import express, { RequestHandler } from "express";
import rateLimiter from "express-rate-limit";
import type { SessionData} from "express-session";
import {
	forgotPassword,
	// getHomepageLeaderboard,
	getHomepageStats,
	listUsers,
	login,
	logout,
	me,
	register,
	resetPassword,
	sendVerificationMail,
	verifyEmail,
} from "../controllers/auth.controller";
import { authRequiredMiddleWare, registerMiddleware, validationMiddleware } from "../middlewares/auth.middleware";
import { registrationStoppedMiddleware } from "../middlewares/registrationStopped.middleware";
import { TooManyRequestsException } from "../models/exceptions";
import {
	listUsersValidator,
	loginValidator,
	registerValidator,
	resetPasswordValidator,
	sendVerifyEmailValidator,
	verifyEmailValidator,
} from "../models/User/Validators/Validators";

const router = express.Router();

const limiter = rateLimiter({
	windowMs: 15 * 60 * 1000,
	max: 100,
	handler: (_req, _res, next) => {
		next(new TooManyRequestsException("Too many requests"));
	},
});

router.post(
	"/register",
	limiter,
	registerValidator,
	registrationStoppedMiddleware as unknown as RequestHandler,
	registerMiddleware as unknown as RequestHandler,
	register as RequestHandler
);

router.post(
	"/login",
	limiter,
	loginValidator,
	validationMiddleware as unknown as RequestHandler,
	login as RequestHandler
);

router.post("/logout", authRequiredMiddleWare as unknown as RequestHandler, logout as RequestHandler);

router.get("/me", authRequiredMiddleWare as unknown as RequestHandler, me as RequestHandler);

router.post(
	"/send-verification-mail",
	limiter,
	sendVerifyEmailValidator,
	validationMiddleware as unknown as RequestHandler,
	sendVerificationMail as RequestHandler
);

router.post(
	"/verify-email",
	verifyEmailValidator,
	validationMiddleware as unknown as RequestHandler,
	verifyEmail as RequestHandler
);

router.post(
	"/forgot-password",
	limiter,
	validationMiddleware as unknown as RequestHandler,
	forgotPassword as RequestHandler
);

router.post(
	"/reset-password",
	resetPasswordValidator,
	validationMiddleware as unknown as RequestHandler,
	resetPassword as RequestHandler
);

router.get("/get-session", (async (req, res) => {
	req.sessionStore.get(req.session.id, (err: any, session: SessionData | null | undefined) => {
		if (err) {
			throw err;
		}
		res.json({
			id: session ? req.session.id : null,
			userId: session?.userId,
			username: session?.username,
			expires_at: session?.cookie.expires,
		});
	});
}) as RequestHandler);

router.get(
	"/list-users",
	authRequiredMiddleWare as unknown as RequestHandler,
	listUsersValidator,
	validationMiddleware as unknown as RequestHandler,
	listUsers as RequestHandler
);

router.get("/stats", getHomepageStats as RequestHandler);

// router.get("/bug_bounty_leaderboard", getHomepageLeaderboard as RequestHandler);

export default router;