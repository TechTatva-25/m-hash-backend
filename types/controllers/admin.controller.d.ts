import { NextFunction, Request, Response } from "express";
interface TypedRequestBody<T> extends Request {
    body: T;
}
interface ProgressRequestBody {
    teamId: string;
}
export declare const sendTeamMail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const AdmingetProgress: (req: TypedRequestBody<ProgressRequestBody>, res: Response, next: NextFunction) => Promise<void>;
export declare const makeJudge: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteTeam: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAllSubmissions: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const adminApprove: (req: Request, res: Response) => Promise<void>;
export declare const adminReject: (req: Request, res: Response) => Promise<void>;
export declare const getAdminStats: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAllJudges: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const assignProblem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deassignProblem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getTeamJudgeMapping: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const exportSubmissionsToExcel: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const extractPublicId: (url: string) => string;
export {};
