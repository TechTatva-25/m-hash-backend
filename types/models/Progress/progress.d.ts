import mongoose, { Document, Model } from "mongoose";
export interface IProgress extends Document {
    stage: mongoose.Types.ObjectId;
    team: mongoose.Types.ObjectId;
    completed: boolean;
    disqualified: boolean;
    createdAt: Date;
    updateStage: Date;
    getProgress(): Promise<Partial<IProgress>>;
}
export interface IProgressModel extends Model<IProgress> {
    createInitialProgress(teamId: mongoose.Types.ObjectId): Promise<void>;
}
declare const _default: IProgressModel;
export default _default;
