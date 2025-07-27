import mongoose, { Document } from "mongoose";
export interface IConfig extends Document {
    key: string;
    value: boolean;
}
declare const _default: mongoose.Model<IConfig, {}, {}, {}, mongoose.Document<unknown, {}, IConfig, {}> & IConfig & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
