import { NextFunction, Request, Response } from "express";
export declare const getColleges: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getCollegesWithState: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getCollege: (req: Request, res: Response, next: NextFunction) => Promise<void>;
