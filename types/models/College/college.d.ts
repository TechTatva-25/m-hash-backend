import mongoose, { Document } from "mongoose";
export interface ICollege extends Document {
    name: string;
    state: string;
}
declare const _default: mongoose.Model<ICollege, {}, {}, {}, mongoose.Document<unknown, {}, ICollege, {}> & ICollege & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
