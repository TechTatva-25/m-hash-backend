import { NextFunction, Request, Response } from "express";

import { Logger } from "../libs/logger";
import {
	HttpException,
	InternalServerErrorException,
} from "../models/exceptions";

export class HttpLogger {
	private logger: Logger;
	constructor(logger: Logger) {
		this.logger = logger;
	}

	public log = (req: Request, _res: Response, next: NextFunction): void => {
		this.logger.logger.info(`Request: ${HttpLogger.formatRequest(req)}`);
		next();
	};

	public error = (
		err: Error | HttpException,
		req: Request,
		res: Response,
		next: NextFunction,
	): void => {
		this.logger.logger.error(
			`Request: ${HttpLogger.formatHttpRequest(req, res)}`,
		);
		this.logger.logger.error(`${err.stack ?? err.message ?? err}`);
		if (res.headersSent) {
			return next(err);
		}
		let exception = err;
		if (!(err instanceof HttpException)) {
			exception = new InternalServerErrorException(
				err.message ?? "Oops! Something went wrong",
			);
		}
		const response: Record<string, unknown> = {
			message: (exception as HttpException).errorMessage,
			status: (exception as HttpException).status,
			data: (exception as HttpException).data,
		};
		if (process.env.NODE_ENV === "development") {
			response.name = err.name;
			response.stack = err.stack;
		}
		res.status((exception as HttpException).status).json(response);
	};

	public static formatRequest(req: Request): string {
		const body = JSON.stringify(req.body, null, 2);
		const headers = JSON.stringify(req.headers, null, 2);
		const ips = JSON.stringify(req.ips, null, 2);
		return `${ips} ${req.method} ${req.url} ${headers} ${body}`;
	}

	public static formatHttpRequest(req: Request, res: Response): string {
		return JSON.stringify(
			{
				request: {
					headers: req.headers,
					host: req.hostname,
					baseUrl: req.baseUrl,
					url: req.url,
					method: req.method,
					body: req.body as Record<string, unknown>,
					params: req.params,
					query: req.query,
					clientIp: req.headers["x-forwarded-for"] ?? req.socket.remoteAddress,
				},
				response: {
					headers: res.getHeaders(),
					statusCode: res.statusCode,
				},
			},
			null,
			2,
		);
	}
}
