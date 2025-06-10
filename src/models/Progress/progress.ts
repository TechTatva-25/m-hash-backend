import mongoose, { Document, Model, Schema } from "mongoose";

import Stage, { Stages } from "../Stage/stage";

export interface IProgress extends Document {
	stage: mongoose.Types.ObjectId;
	team: mongoose.Types.ObjectId;
	completed: boolean;
	disqualified: boolean;
	createdAt: Date;
	updateStage: Date;
	getProgress(): Promise<Partial<IProgress>>;
}

export interface IProgressModel extends Model<IProgress> {
	createInitialProgress(teamId: mongoose.Types.ObjectId): Promise<void>;
}

const ProgressSchema: Schema<IProgress> = new Schema<IProgress>(
	{
		stage: { type: Schema.Types.ObjectId, ref: "Stage", required: true },
		team: { type: Schema.Types.ObjectId, ref: "Team", required: true },
		completed: { type: Boolean, default: false },
		disqualified: { type: Boolean, default: false },
	},
	{ collection: "progress", timestamps: true }
);

ProgressSchema.statics.createInitialProgress = async function (teamId: mongoose.Types.ObjectId): Promise<void> {
	const stage = await Stage.findOne({ stage: Stages.SUBMISSION, end_date: { $gte: new Date() } });
	if (!stage) {
		throw new Error("No stage is ongoing");
	}
	if (stage.stage !== Stages.SUBMISSION) {
		throw new Error("Submission stage is over");
	}
	await this.create({ stage: stage._id, team: teamId });
};

ProgressSchema.methods.getProgress = async function (): Promise<Partial<IProgress>> {
	const progress = (this as IProgress).toObject() as IProgress;
	const stage = await Stage.findOne({ _id: progress.stage });
	if (!stage) {
		throw new Error("Stage not found");
	}
	if (stage.active) {
		return { ...progress, completed: false, disqualified: false };
	}
	if (stage.stage === Stages.RESULTS && progress.completed && stage.end_date < new Date()) {
		return { ...progress, completed: true, disqualified: false };
	}
	const previousStage = stage.stage === Stages.REGISTRATION ? stage : await stage.getPreviousStage();
	if (previousStage && previousStage._id === progress.stage && previousStage.end_date < new Date()) {
		return { ...progress, completed: false, disqualified: true };
	}
	return { ...progress, completed: false, disqualified: false };
};

export default mongoose.model<IProgress, IProgressModel>("Progress", ProgressSchema);
