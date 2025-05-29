import { body, query } from "express-validator";

export const createTeamValidator = [
	body("name", "Please enter the team name").isString().isLength({ min: 1, max: 255 }),
];

export const listTeamsValidator = [
	query("limit").isInt({ min: 1, max: 1000 }).optional(),
	query("offset").isInt({ min: 0 }).optional(),
	query("team_name").isString().optional(),
];

export const removeMemberValidator = [body("teamId").isString().isMongoId(), body("memberId").isString().isMongoId()];