import { NextFunction, Request, Response } from "express";
export declare function registerMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void>;
export declare function validationMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void>;
export declare function authRequiredMiddleWare(req: Request, _res: Response, next: NextFunction): Promise<void>;
export declare function adminRequiredMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void>;
export declare function judgeRequiredMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void>;
