import { RequestHandler, Router } from "express";
import rateLimit from "express-rate-limit";

import { TooManyRequestsException } from "../models/exceptions";
import {
	createTicketValidator,
	deleteTicketValidator,
	getTicketValidator,
	updateTicketValidator,
} from "../models/Ticket/validator";
import {
	adminRequiredMiddleware,
	validationMiddleware,
} from "../middlewares/auth.middleware";
import {
	createTicket,
	deleteTicket,
	getTicket,
	getTickets,
	updateTicket,
} from "../controllers/ticket.controller";

const router = Router();

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 50,
	handler: (_req, _res, next) => {
		next(new TooManyRequestsException("Too many requests"));
	},
});

router.post(
	"/create",
	limiter,
	createTicketValidator,
	validationMiddleware as RequestHandler,
	createTicket as RequestHandler,
);

router.get(
	"/get",
	adminRequiredMiddleware as RequestHandler,
	getTicketValidator,
	validationMiddleware as RequestHandler,
	getTicket as RequestHandler,
);

router.get(
	"/list",
	adminRequiredMiddleware as RequestHandler,
	getTickets as RequestHandler,
);

router.patch(
	"/update",
	adminRequiredMiddleware as RequestHandler,
	updateTicketValidator,
	validationMiddleware as RequestHandler,
	updateTicket as RequestHandler,
);

router.delete(
	"/delete",
	adminRequiredMiddleware as RequestHandler,
	deleteTicketValidator,
	validationMiddleware as RequestHandler,
	deleteTicket as RequestHandler,
);

export default router;
