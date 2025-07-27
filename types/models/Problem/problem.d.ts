import mongoose, { Document } from "mongoose";
export interface IProblem extends Document {
    title: string;
    description: string;
    thumbnail: string;
    features: string[];
    type: string;
    sdg_id: number;
    sdg_title: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IProblem, {}, {}, {}, mongoose.Document<unknown, {}, IProblem, {}> & IProblem & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
