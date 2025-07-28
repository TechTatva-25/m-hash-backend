import mongoose, { Document, Schema } from "mongoose";

export interface ICollege extends Document {
	name: string;
	state: string;
}

const CollegeSchema: Schema<ICollege> = new Schema<ICollege>({
	name: { type: String, required: true },
	state: { type: String, required: true },
});

export default mongoose.model<ICollege>("College", CollegeSchema);
