import type { NextFunction, Request, Response } from "express";
export declare const getProblems: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getProblem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createProblem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProblem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteProblem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
