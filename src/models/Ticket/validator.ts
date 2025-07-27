import { body, query } from "express-validator";

export const getTicketValidator = [query("ticket_id").isString().isMongoId()];

export const createTicketValidator = [
	body("email").isEmail().isLength({ min: 1, max: 200 }),
	body("message").isString().isLength({ min: 1, max: 3000 }),
];

export const updateTicketValidator = [
	query("ticket_id").isString().isMongoId(),
	body("resolved").isBoolean(),
];

export const deleteTicketValidator = [
	query("ticket_id").isString().isMongoId(),
];
