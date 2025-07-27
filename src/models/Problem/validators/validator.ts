import { body, query } from "express-validator";

export const createProblemValidator = [
	body("title").isString().isLength({ min: 1, max: 255 }),
	body("description").isString().isLength({ min: 1, max: 5000 }),
	body("thumbnail").isString().isLength({ min: 1, max: 255 }),
	body("sdg_id").isInt(),
	body("sdg_title").isString().isLength({ min: 1, max: 255 }),
];

export const deleteProblemValidator = [
	body("problem_id").isString().isMongoId(),
];

export const getProblemValidator = [query("problem_id").isString().isMongoId()];

export const updateProblemValidator = [
	body("problem_id").isString().isMongoId(),
	body("title").isString().isLength({ min: 1, max: 255 }).optional(),
	body("description").isString().isLength({ min: 1, max: 5000 }).optional(),
	body("thumbnail").isString().isLength({ min: 1, max: 255 }).optional(),
	body("sdg_id").isInt().optional(),
	body("sdg_title").isString().isLength({ min: 1, max: 255 }).optional(),
];
