import express, { RequestHandler } from "express";

import {
	getCollege,
	getColleges,
	getCollegesWithState,
} from "../controllers/college.controller";
import {
	adminRequiredMiddleware,
	validationMiddleware,
} from "../middlewares/auth.middleware";
import { getCollegeValidator } from "../models/College/validators/validator";

const router = express.Router();

router.get(
	"/get",
	getCollegeValidator,
	validationMiddleware as RequestHandler,
	getCollege as RequestHandler,
);

router.get(
	"/getWithState",
	adminRequiredMiddleware as RequestHandler,
	validationMiddleware as RequestHandler,
	getCollegesWithState as RequestHandler,
);

router.get("/list", getColleges as RequestHandler);

export default router;
