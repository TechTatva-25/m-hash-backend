export class HttpException extends Error {
	name: string;
	errorMessage: string;
	status: number;
	data: Record<string, unknown>;

	constructor(
		status: number,
		message: string,
		data: Record<string, unknown> = {},
	) {
		super(message);
		this.name = this.constructor.name;
		this.errorMessage = message;
		this.status = status;
		this.data = data;
	}
}

export class BadRequestException extends HttpException {
	constructor(message: string, data: Record<string, unknown> = {}) {
		super(400, message, data);
	}
}

export class UnauthorizedException extends HttpException {
	constructor(message: string, data: Record<string, unknown> = {}) {
		super(401, message, data);
	}
}

export class ForbiddenException extends HttpException {
	constructor(message: string, data: Record<string, unknown> = {}) {
		super(403, message, data);
	}
}

export class NotFoundException extends HttpException {
	constructor(message: string, data: Record<string, unknown> = {}) {
		super(404, message, data);
	}
}

export class ConflictException extends HttpException {
	constructor(message: string, data: Record<string, unknown> = {}) {
		super(409, message, data);
	}
}

export class UnprocessableEntityException extends HttpException {
	constructor(message: string, data: Record<string, unknown> = {}) {
		super(422, message, data);
	}
}

export class TooManyRequestsException extends HttpException {
	constructor(message: string, data: Record<string, unknown> = {}) {
		super(429, message, data);
	}
}

export class InternalServerErrorException extends HttpException {
	constructor(message: string, data: Record<string, unknown> = {}) {
		super(500, message, data);
	}
}

export class NotImplementedException extends HttpException {
	constructor(message: string, data: Record<string, unknown> = {}) {
		super(501, message, data);
	}
}
