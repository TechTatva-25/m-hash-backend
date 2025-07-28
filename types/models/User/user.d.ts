import mongoose, { Document } from "mongoose";
export declare enum UserRoles {
    USER = "user",
    ADMIN = "admin",
    JUDGE = "judge"
}
export interface IUser extends Document {
    email: string;
    username: string;
    gender: string;
    password: string;
    mobile_number: string;
    college: mongoose.Types.ObjectId;
    collegeOther: string;
    role: UserRoles;
    problem_statement?: string[];
    verified: boolean;
    otp?: string;
    otpExpiresAt?: Date;
    token?: string;
    createdAt: Date;
    updatedAt: Date;
    validPassword(password: string): Promise<boolean>;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
