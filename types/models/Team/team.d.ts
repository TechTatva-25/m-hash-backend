import mongoose, { Document } from "mongoose";
export declare const TEAM_LIMIT = 5;
interface BugRecord {
    score: number;
    bug_count: 0;
    updatedAt: string;
}
export interface IJudgeScore extends Document {
    judge_id: mongoose.Types.ObjectId;
    scores: {
        round_id: mongoose.Types.ObjectId;
        category_scores: {
            category_id: string;
            score: number;
        }[];
    }[];
}
export interface ITeam extends Document {
    name: string;
    members: mongoose.Types.ObjectId[];
    team_leader: mongoose.Types.ObjectId;
    college: mongoose.Types.ObjectId;
    collegeOther: string;
    createdAt: Date;
    updatedAt: Date;
    bugs: BugRecord[];
    judge_score: IJudgeScore[];
    deployed: boolean;
}
export declare const JudgeScore: mongoose.Model<IJudgeScore, {}, {}, {}, mongoose.Document<unknown, {}, IJudgeScore, {}> & IJudgeScore & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
declare const _default: mongoose.Model<ITeam, {}, {}, {}, mongoose.Document<unknown, {}, ITeam, {}> & ITeam & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
