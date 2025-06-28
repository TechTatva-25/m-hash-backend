import mongoose, { Document } from "mongoose";
export declare enum Stages {
    REGISTRATION = "registration",
    SUBMISSION = "submission",
    QUALIFIERS = "qualifiers",
    FINALS = "finals",
    RESULTS = "results"
}
export interface IStage extends Document {
    stage: Stages;
    name: string;
    description: string;
    active: boolean;
    start_date: Date;
    end_date: Date;
    createdAt: Date;
    updatedAt: Date;
    getPreviousStage(): Promise<IStage | null>;
}
declare const _default: mongoose.Model<IStage, {}, {}, {}, mongoose.Document<unknown, {}, IStage, {}> & IStage & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
