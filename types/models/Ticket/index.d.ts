import mongoose, { InferSchemaType } from "mongoose";
declare const TicketSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    message: string;
    email: string;
    resolved: boolean;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    message: string;
    email: string;
    resolved: boolean;
}>, {}> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    message: string;
    email: string;
    resolved: boolean;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export type ITicket = InferSchemaType<typeof TicketSchema>;
declare const _default: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    message: string;
    email: string;
    resolved: boolean;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    message: string;
    email: string;
    resolved: boolean;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    message: string;
    email: string;
    resolved: boolean;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    message: string;
    email: string;
    resolved: boolean;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    message: string;
    email: string;
    resolved: boolean;
}>, {}> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    message: string;
    email: string;
    resolved: boolean;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
