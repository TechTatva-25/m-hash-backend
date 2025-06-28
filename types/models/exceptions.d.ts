export declare class HttpException extends Error {
    name: string;
    errorMessage: string;
    status: number;
    data: Record<string, unknown>;
    constructor(status: number, message: string, data?: Record<string, unknown>);
}
export declare class BadRequestException extends HttpException {
    constructor(message: string, data?: Record<string, unknown>);
}
export declare class UnauthorizedException extends HttpException {
    constructor(message: string, data?: Record<string, unknown>);
}
export declare class ForbiddenException extends HttpException {
    constructor(message: string, data?: Record<string, unknown>);
}
export declare class NotFoundException extends HttpException {
    constructor(message: string, data?: Record<string, unknown>);
}
export declare class ConflictException extends HttpException {
    constructor(message: string, data?: Record<string, unknown>);
}
export declare class UnprocessableEntityException extends HttpException {
    constructor(message: string, data?: Record<string, unknown>);
}
export declare class TooManyRequestsException extends HttpException {
    constructor(message: string, data?: Record<string, unknown>);
}
export declare class InternalServerErrorException extends HttpException {
    constructor(message: string, data?: Record<string, unknown>);
}
export declare class NotImplementedException extends HttpException {
    constructor(message: string, data?: Record<string, unknown>);
}
