import mongoose, { Document, Schema } from "mongoose";

export enum Stages {
	REGISTRATION = "registration",
	SUBMISSION = "submission",
	QUALIFIERS = "qualifiers",
	FINALS = "finals",
	RESULTS = "results",
}

export interface IStage extends Document {
	stage: Stages;
	name: string;
	description: string;
	active: boolean;
	start_date: Date;
	end_date: Date;
	createdAt: Date;
	updatedAt: Date;
	getPreviousStage(): Promise<IStage | null>;
}

const StageSchema: Schema<IStage> = new Schema<IStage>(
	{
		stage: {
			type: String,
			enum: [
				Stages.REGISTRATION,
				Stages.SUBMISSION,
				Stages.QUALIFIERS,
				Stages.FINALS,
				Stages.RESULTS,
			],
			required: true,
		},
		name: { type: String, required: true },
		description: { type: String, required: true },
		active: { type: Boolean, default: false },
		start_date: { type: Date, required: true },
		end_date: { type: Date, required: true },
	},
	{ timestamps: true },
);

StageSchema.methods.getPreviousStage =
	async function (): Promise<IStage | null> {
		const stage = (this as IStage).toObject() as IStage;
		const previousStage = await mongoose
			.model<IStage>("Stage")
			.findOne({ stage: { $lt: stage.stage } })
			.sort({ stage: -1 });
		return previousStage;
	};

export default mongoose.model<IStage>("Stage", StageSchema);
