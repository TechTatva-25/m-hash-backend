import { body } from "express-validator";

export const inviteUserValidator = [
	body("userId").isMongoId(),
	body("teamId").isMongoId(),
];

export const sendJoinRequestValidator = [body("teamId").isMongoId()];

export const outGoingInviteValidator = [body("inviteId").isMongoId()];

export const inviteValidator = [body("inviteId").isMongoId()];
