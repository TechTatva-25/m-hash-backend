import mongoose, { Document } from "mongoose";
export declare enum InviteType {
    OUTGOING = "outgoing",
    INCOMING = "incoming"
}
export interface IInvite extends Document {
    team: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    type: InviteType;
    createdAt: Date;
    updatedAt: Date;
}
declare const Invite: mongoose.Model<IInvite, {}, {}, {}, mongoose.Document<unknown, {}, IInvite, {}> & IInvite & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Invite;
