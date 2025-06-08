import bcrypt from "bcrypt";
import mongoose, { Document, Schema } from "mongoose";

export enum UserRoles {
	USER = "user",
	ADMIN = "admin",
	JUDGE = "judge",
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

const UserSchema: Schema<IUser> = new Schema<IUser>(
	{
		email: { type: String, required: true },
		username: { type: String, required: true },
		gender: { type: String, required: true },
		password: { type: String, required: true },
		mobile_number: { type: String, required: true },
		college: { type: Schema.Types.ObjectId, ref: "College", required: true },
		collegeOther: { type: String, required: true },
		role: { type: String, enum: [UserRoles.USER, UserRoles.ADMIN, UserRoles.JUDGE], default: UserRoles.USER },
		verified: { type: Boolean, default: false },
		problem_statement: [{ type: String, ref: "ProblemStatement" }],
		otp: { type: String, required: false, default: null },
		otpExpiresAt: { type: Date, required: false, default: null },
		token: { type: String, required: false, default: null },
	},
	{ timestamps: true }
);

UserSchema.pre<IUser>("save", async function (next) {
	if (!this.isModified("password")) return next();
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

UserSchema.methods.validPassword = async function (password: string): Promise<boolean> {
	return bcrypt.compare(password, (this as IUser).password);
};

UserSchema.methods.toJSON = function (): Partial<IUser> {
	const user = (this as IUser).toObject() as IUser;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { password, otp, ...rest } = user;
	return rest;
};

export default mongoose.model<IUser>("User", UserSchema);