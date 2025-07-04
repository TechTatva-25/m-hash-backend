import type { NextFunction, Request, Response } from "express";
export declare const getTickets: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getTicket: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createTicket: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateTicket: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteTicket: (req: Request, res: Response, next: NextFunction) => Promise<void>;
