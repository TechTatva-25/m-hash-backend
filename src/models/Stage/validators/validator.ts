import { body } from "express-validator";

export const createStageValidator = [
	body("stage").isString().isIn(["registration", "submission", "qualifiers", "finals", "results"]),
	body("name").isString().isLength({ min: 1, max: 255 }),
	body("description").isString().isLength({ min: 1, max: 255 }),
	body("active").isBoolean(),
	body("start_date").isISO8601().toDate(),
	body("end_date").isISO8601().toDate(),
];

export const updateStageValidator = [
	body("stageId").isString().isMongoId(),
	body("name").isString().isLength({ min: 1, max: 255 }),
	body("active").isBoolean(),
	body("description").isString().isLength({ min: 1, max: 255 }),
	body("start_date").isDate(),
	body("end_date").isDate(),
];

export const deleteStageValidator = [body("stageId").isString().isMongoId()];

export const getProgressValidator = [body("teamId").isString().isMongoId()];