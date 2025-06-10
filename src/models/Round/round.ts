import mongoose, { Document, Schema } from "mongoose";

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

const CategorySchema: Schema<ICategory> = new Schema<ICategory>(
	{
		category_id: { type: String, required: true },
		name: { type: String, required: true },
		description: { type: String, required: true },
		max_score: { type: Number, required: true },
	},
	{ _id: false }
);

const RoundSchema: Schema<IRound> = new Schema<IRound>(
	{
		name: { type: String, required: true },
		categories: { type: [CategorySchema], required: true },
	},
	{ timestamps: true }
);

export const Category = mongoose.model<ICategory>("Category", CategorySchema);

export default mongoose.model<IRound>("Round", RoundSchema);
