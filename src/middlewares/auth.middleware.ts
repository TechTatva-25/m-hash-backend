import { NextFunction, Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";

import { BadRequestException, ForbiddenException, UnprocessableEntityException } from "../models/exceptions";
import User, { UserRoles } from "../models/User/user";

export async function registerMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
	try {
		const result = validationResult(req);
		if (!result.isEmpty()) {
			throw new UnprocessableEntityException("Validation failed", { errors: result.array() });
		}
		const data = matchedData<Record<string, string>>(req);
		const check = await User.findOne({ email: data.email });
		if (check) {
			throw new BadRequestException("Email already exists");
		}
		// const mobileCheck = await User.findOne({ mobile_number: data.mobile_number });
		// if (mobileCheck) {
		//  throw new BadRequestException("Mobile number already exists");
		// }
		next();
	} catch (err) {
		next(err);
	}
}

export async function validationMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
	try {
		const result = validationResult(req);
		if (!result.isEmpty()) {
			throw new UnprocessableEntityException("Validation failed", { errors: result.array() });
		}
		next();
	} catch (err) {
		next(err);
	}
}

export async function authRequiredMiddleWare(req: Request, _res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.session.userId) {
			throw new ForbiddenException("Not authenticated");
		}
		const user = await User.findById(req.session.userId);
		if (!user) {
			throw new ForbiddenException("User not found");
		}
		if (!user.verified) {
			throw new ForbiddenException("User not verified, please check your email");
		}
		next();
	} catch (err) {
		next(err);
	}
}

export async function adminRequiredMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.session.userId) {
			throw new ForbiddenException("Not authenticated");
		}
		const user = await User.findById(req.session.userId);
		if (!user) {
			throw new ForbiddenException("User not found");
		}
		if (!user.verified) {
			throw new ForbiddenException("User not verified, please check your email");
		}
		if (user.role !== UserRoles.ADMIN) {
			throw new ForbiddenException("User is not an admin");
		}
		next();
	} catch (err) {
		next(err);
	}
}

export async function judgeRequiredMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.session.userId) {
			throw new ForbiddenException("Not authenticated");
		}
		const user = await User.findById(req.session.userId);
		if (!user) {
			throw new ForbiddenException("User not found");
		}
		if (!user.verified) {
			throw new ForbiddenException("User not verified, please check your email");
		}
		if (!(user.role == UserRoles.JUDGE || user.role == UserRoles.ADMIN)) {
			throw new ForbiddenException("User does not have judge or admin privileges");
		}
		next();
	} catch (err) {
		next(err);
	}
}