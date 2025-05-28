import mongoose, { Document, Schema } from "mongoose";

export const TEAM_LIMIT = 5;

interface BugRecord {
	score: number;
	bug_count: 0;
	updatedAt: string;
}

const BugRecordSchema = new Schema({
	score: { type: Schema.Types.Number, required: true },
	bug_count: { type: Schema.Types.Number, required: true },
	updatedAt: { type: Date, default: Date.now },
});

export interface IJudgeScore extends Document {
	judge_id: mongoose.Types.ObjectId;
	scores: {
		round_id: mongoose.Types.ObjectId;
		category_scores: {
			category_id: string;
			score: number;
		}[];
	}[];
}

export interface ITeam extends Document {
	name: string;
	members: mongoose.Types.ObjectId[];
	team_leader: mongoose.Types.ObjectId;
	college: mongoose.Types.ObjectId;
	collegeOther: string;
	createdAt: Date;
	updatedAt: Date;
	bugs: BugRecord[];
	judge_score: IJudgeScore[];
	deployed: boolean;
}

const JudgeScoreSchema: Schema<IJudgeScore> = new Schema<IJudgeScore>({
	judge_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
	scores: [
		{
			round_id: { type: Schema.Types.ObjectId, ref: "Round", required: true },
			category_scores: [
				{
					category_id: { type: String, ref: "Category", required: true },
					score: { type: Number, required: true },
				},
			],
		},
	],
});

const TeamSchema: Schema<ITeam> = new Schema<ITeam>(
	{
		name: { type: String, required: true },
		members: [{ type: Schema.Types.ObjectId, ref: "User" }],
		team_leader: { type: Schema.Types.ObjectId, ref: "User" },
		college: { type: Schema.Types.ObjectId, ref: "College" },
		collegeOther: { type: String, required: true },
		bugs: { type: [BugRecordSchema], required: true },
		judge_score: { type: [JudgeScoreSchema], default: [] },
		deployed: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

export const JudgeScore = mongoose.model<IJudgeScore>("JudgeScore", JudgeScoreSchema);

export default mongoose.model<ITeam>("Team", TeamSchema);