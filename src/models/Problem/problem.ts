import mongoose, { Document, Schema } from "mongoose";

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

const ProblemSchema: Schema<IProblem> = new Schema<IProblem>(
	{
		title: { type: String, required: true },
		description: { type: String, required: true },
		thumbnail: { type: String, required: true },
		features: { type: [String], required: true },
		type: { type: String, required: true },
		sdg_id: { type: Number, required: true },
		sdg_title: { type: String, required: true },
	},
	{ timestamps: true }
);

export default mongoose.model<IProblem>("Problem", ProblemSchema);
