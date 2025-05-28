import { NextFunction, Request, Response } from "express";

import { ForbiddenException } from "../models/exceptions";
import Stage, { Stages } from "../models/Stage/stage";

export async function registrationStoppedMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
	try {
		if (req.method.toLocaleLowerCase() === "get") {
			next();
		} else {
			const stage = await Stage.findOne({ stage: Stages.SUBMISSION, end_date: { $gte: new Date() } }, "_id");

			if (!stage) {
				throw new ForbiddenException("This action cannot be performed as the submission deadline has passed.");
			}

			next();
		}
	} catch (err) {
		next(err);
	}
}