import { NextFunction, Request, Response } from "express";
export interface queryProps {
    $or?: Record<string, {
        $regex: string;
        $options: string;
    }>[];
    college?: string;
    collegeOther?: string;
}
export declare const register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const logout: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const me: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const sendVerificationMail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const verifyEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const forgotPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const resetPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const listUsers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getHomepageStats: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getHomepageLeaderboard: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
