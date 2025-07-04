import { NextFunction, Request, Response } from "express";
import { Logger } from "../libs/logger";
import { HttpException } from "../models/exceptions";
export declare class HttpLogger {
    private logger;
    constructor(logger: Logger);
    log: (req: Request, _res: Response, next: NextFunction) => void;
    error: (err: Error | HttpException, req: Request, res: Response, next: NextFunction) => void;
    static formatRequest(req: Request): string;
    static formatHttpRequest(req: Request, res: Response): string;
}
