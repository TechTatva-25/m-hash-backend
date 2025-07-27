import { body } from "express-validator";

export const createSubmissionValidator = [
	body("problem_id").isString().isMongoId(),
];

export const deleteSubmissionValidator = [
	body("submission_id").isString().isMongoId(),
];
