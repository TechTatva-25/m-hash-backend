import mongoose, { Document, Schema } from "mongoose";

export enum SubmissionStatus {
	PENDING = "pending",
	ADMIN_APPROVED = "admin-ap",
	ADMIN_REJECTED = "admin-rj",
	JUDGE_APPROVED = "judge-ap",
	JUDGE_REJECTED = "judge-rj",
	DISPLAY_UNDER_EVAL = "Under Evaluation",
	DISPLAY_REJECTED = "Not qualified",
	DISPLAY_QUALIFIED = "QUALIFIED",
}

export interface ISubmission extends Document {
	team_id: mongoose.Types.ObjectId;
	problem_id: mongoose.Types.ObjectId;
	submission_file_name: string;
	submission_video_file_name: string;
	submission_url: string;
	submission_video_url: string;
	status: SubmissionStatus;
	createdAt: Date;
	updatedAt: Date;
}

const SubmissionSchema: Schema<ISubmission> = new Schema<ISubmission>(
	{
		team_id: { type: Schema.Types.ObjectId, ref: "Team", required: true },
		problem_id: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
		submission_file_name: { type: String, required: true },
		// submission_video_file_name: { type: String, required: false },
		submission_url: { type: String, required: false },
		// submission_video_url: { type: String, required: false },
		submission_video_url: {
			type: String,
			required: true,
			validate: {
				validator: function (v: string): boolean {
					const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/i;
					return urlRegex.test(v);
				},
				message: "Invalid demo video URL",
			},
		},
		status: {
			type: String,
			enum: [
				SubmissionStatus.PENDING,
				SubmissionStatus.ADMIN_APPROVED,
				SubmissionStatus.ADMIN_REJECTED,
				SubmissionStatus.JUDGE_APPROVED,
				SubmissionStatus.JUDGE_REJECTED,
			],
			default: SubmissionStatus.PENDING,
		},
	},
	{ timestamps: true },
);

export default mongoose.model<ISubmission>("Submission", SubmissionSchema);
