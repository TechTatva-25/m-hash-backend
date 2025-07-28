import type { NextFunction, Request, Response } from "express";

import Ticket from "../models/Ticket";

export const getTickets = async (
	_req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const tickets = await Ticket.find();

		res.status(200).json(tickets);
	} catch (error) {
		next(error);
	}
};

export const getTicket = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { ticket_id } = req.query as Record<string, string>;

		const ticket = await Ticket.findById(ticket_id);

		if (!ticket) {
			res.status(404).json({ message: "Ticket not found" });
			return;
		}

		res.status(200).json(ticket);
	} catch (error) {
		next(error);
	}
};

export const createTicket = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { email, message } = req.body as Record<string, string>;

		await Ticket.create({ email, message });

		res.status(201).json({
			message: "Thank you for your message. We'll get back to you soon.",
		});
	} catch (error) {
		next(error);
	}
};

export const updateTicket = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { ticket_id } = req.query as Record<string, string>;
		const { resolved } = req.body as Record<string, string>;

		const ticket = await Ticket.findByIdAndUpdate(
			ticket_id,
			{ resolved },
			{ new: true },
		);

		if (!ticket) {
			res.status(404).json({ message: "Ticket not found" });
			return;
		}

		res.status(200).json(ticket);
	} catch (error) {
		next(error);
	}
};

export const deleteTicket = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { ticket_id } = req.query as Record<string, string>;

		const ticket = await Ticket.findByIdAndDelete(ticket_id);
		if (!ticket) {
			res.status(404).json({ message: "Ticket not found" });
			return;
		}

		res.status(200).json({ message: "Ticket deleted successfully" });
	} catch (error) {
		next(error);
	}
};
