import mongoose, { Document } from "mongoose";
export declare enum SubmissionStatus {
    PENDING = "pending",
    ADMIN_APPROVED = "admin-ap",
    ADMIN_REJECTED = "admin-rj",
    JUDGE_APPROVED = "judge-ap",
    JUDGE_REJECTED = "judge-rj",
    DISPLAY_UNDER_EVAL = "Under Evaluation",
    DISPLAY_REJECTED = "Not qualified",
    DISPLAY_QUALIFIED = "QUALIFIED"
}
export interface ISubmission extends Document {
    team_id: mongoose.Types.ObjectId;
    problem_id: mongoose.Types.ObjectId;
    submission_file_name: string;
    submission_video_file_name: string;
    submission_url: string;
    submission_video_url: string;
    status: SubmissionStatus;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ISubmission, {}, {}, {}, mongoose.Document<unknown, {}, ISubmission, {}> & ISubmission & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
