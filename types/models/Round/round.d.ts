import mongoose, { Document } from "mongoose";
export interface ICategory extends Document {
    category_id: string;
    name: string;
    description: string;
    max_score: number;
}
export interface IRound extends Document {
    name: string;
    categories: ICategory[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const Category: mongoose.Model<ICategory, {}, {}, {}, mongoose.Document<unknown, {}, ICategory, {}> & ICategory & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
declare const _default: mongoose.Model<IRound, {}, {}, {}, mongoose.Document<unknown, {}, IRound, {}> & IRound & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
