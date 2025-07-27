import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

//import { getFile } from "../libs/s3";
import College from "../models/College/college";
import Config from "../models/Config/config";
import { BadRequestException, ConflictException } from "../models/exceptions";
import Problem from "../models/Problem/problem";
import Round from "../models/Round/round";
import Submission, { SubmissionStatus } from "../models/Submission/submission";
import Team, { ITeam, JudgeScore } from "../models/Team/team";
import User from "../models/User/user";

interface Prob {
	_id: string;
	title: string;
	sdg_id: number;
}

export const updateSubmissionStatus = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { submissionId } = req.body as Record<string, string>;

		if (!submissionId) {
			throw new Error("Submission ID is required");
		}

		const updatedSubmission = await Submission.findByIdAndUpdate(
			submissionId,
			{ status: SubmissionStatus.JUDGE_APPROVED },
			{ new: true },
		);

		if (!updatedSubmission) {
			throw new Error("Submission not found");
		}

		res.status(200).json(updatedSubmission);
	} catch (error) {
		next(error);
	}
};

export const RejectSubmissionStatus = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { submissionId } = req.body as Record<string, string>;

		if (!submissionId) {
			throw new Error("Submission ID is required");
		}

		const updatedSubmission = await Submission.findByIdAndUpdate(
			submissionId,
			{ status: SubmissionStatus.JUDGE_REJECTED },
			{ new: true },
		);

		if (!updatedSubmission) {
			throw new Error("Submission not found");
		}

		res.status(200).json(updatedSubmission);
	} catch (error) {
		next(error);
	}
};

// File submission is not setup right now

// export const getAllSubmissions = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
// 	try {
// 		const userId = _req.session.userId;
// 		if (!userId) {
// 			throw new Error("User ID is required");
// 		}
// 		const user = await User.findOne({ _id: userId });
// 		const problemIds = user?.problem_statement;

// 		const submissions = await Submission.find({ problem_id: { $in: problemIds } });

// 		for (const submission of submissions) {
// 			const getFileResponse = await getFile(
// 				submission.submission_file_name ? submission.submission_file_name : submission.submission_url,
// 				true
// 			);

// 			if (getFileResponse.submissionUrl) {
// 				submission.submission_url = getFileResponse.submissionUrl;
// 			} else {
// 				submission.submission_url = "URL fetch failure";
// 			}

// 			const submission_video_file_name = submission.submission_video_file_name;

// 			if (submission_video_file_name) {
// 				const getFileResponse = await getFile(submission.submission_video_file_name, false);

// 				if (!getFileResponse.submissionUrl) {
// 					throw new BadRequestException("Submission URL fetch failure for video");
// 				}

// 				submission.submission_video_url = getFileResponse.submissionUrl;
// 			}
// 		}

// 		res.status(200).json(submissions);
// 	} catch (error) {
// 		next(error);
// 	}
// };

export const getTeam = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { teamId } = req.body as Record<string, string>;

		if (!teamId) {
			throw new Error("Submission ID is required");
		}

		const team = await Team.findOne({ _id: teamId });

		if (!team) {
			throw new Error("Team not found");
		}

		res.status(200).json(team);
	} catch (error) {
		next(error);
	}
};

export const getProb = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { probId } = req.body as Record<string, string>; // Get the submission ID from the request body

		if (!probId) {
			throw new Error("Submission ID is required");
		}

		const prob = await Problem.findOne({ _id: probId });

		if (!prob) {
			throw new Error("prob not found");
		}

		res.status(200).json(prob);
	} catch (error) {
		next(error);
	}
};

export const listTeamsWithBugRound = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const limit = parseInt(req.query.limit as string) || 10;
		let offset = parseInt(req.query.offset as string) || 0;
		const name = (req.query.team_name as string) || "";
		if (limit > 1000 || limit < 0) {
			throw new BadRequestException("Limit must be between 0 and 1000");
		}
		const options: Record<
			string,
			string | { $regex: string; $options?: string } | { $in: string[] }
		> = {};
		if (name) {
			options.name = { $regex: name, $options: "i" };
		}

		const user = await User.findById(req.session.userId);
		if (!user) {
			throw new ConflictException("User not found");
		}

		const college = await College.findById(user.college);
		if (!college) {
			throw new BadRequestException("User's college not found");
		} else if (college.name !== "OTHER" && req.session.role === "user") {
			options.college = user.college.toString();
		}

		const total = await Team.countDocuments(options);
		if (offset > total || offset < 0) {
			offset = limit > total ? 0 : total - limit;
		}

		const approvedTeamIds = (
			await Submission.find(
				{
					status: SubmissionStatus.ADMIN_APPROVED,
				},
				"team_id -_id",
			)
		).map((submission) => submission.team_id.toString());

		options._id = { $in: approvedTeamIds };

		const teams = await Team.find(options)
			.limit(limit)
			.skip(offset)
			.populate("team_leader")
			.lean();

		res
			.status(200)
			.json({
				limit,
				offset,
				total,
				teams: teams,
				hasMore: offset + limit < total,
			});
	} catch (error) {
		next(error);
	}
};

export const updateBugRoundScore = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { teamId, score, restoreIdx } = req.body as Record<string, string>;
		const team = await Team.findById(teamId);
		if (!team) {
			throw new Error("Team not found");
		}

		const _restoreIdxParsed = parseInt(restoreIdx);

		if (!isNaN(_restoreIdxParsed)) {
			await Team.updateOne(
				{ _id: teamId },
				{
					bugs:
						_restoreIdxParsed === -1
							? []
							: team.bugs.slice(restoreIdx as unknown as number),
				},
			);
		} else {
			await Team.updateOne(
				{ _id: teamId },
				{
					bugs: [
						{
							score:
								(team as unknown as ITeam).bugs.length === 0
									? score
									: /* eslint-disable @typescript-eslint/restrict-plus-operands */
										score + (team as unknown as ITeam).bugs[0].score,
							bug_count: team.bugs.length + 1,
							updatedAt: Date.now(),
						},
						...(team as unknown as ITeam).bugs,
					],
				},
			);
		}

		res.status(200).send("Score updated successfully");
	} catch (err) {
		console.log(err);
		next(err);
	}
};

export const getAllApprovedTeams = async (
	_req: Request,
	res: Response,
): Promise<void> => {
	try {
		const submissions = await Submission.find({
			status: SubmissionStatus.ADMIN_APPROVED,
		});
		const approvedTeams = await Team.find({
			_id: { $in: submissions.map((submission) => submission.team_id) },
		}).lean();
		//console.log(approvedTeams)

		const approvedTeamsWithProblemDetails = await Promise.all(
			approvedTeams.map(async (team) => {
				const problem = await Submission.aggregate([
					{
						$addFields: {
							team_id_obj: { $toObjectId: "$team_id" },
							problem_id_obj: { $toObjectId: "$problem_id" },
						},
					},
					{ $match: { team_id_obj: team._id } },
					{
						$lookup: {
							from: "problems",
							localField: "problem_id_obj",
							foreignField: "_id",
							as: "joined_data",
						},
					},
					{
						$unwind: "$joined_data",
					},
					{
						$project: {
							_id: "$joined_data._id",
							title: "$joined_data.title",
							sdg_id: "$joined_data.sdg_id",
						},
					},
				]);

				const prob = (problem as unknown as Prob[])[0];

				return {
					...team,
					problemId: prob?._id ?? null,
					problemTitle: prob?.title ?? "Not Found",
					sdg_id: prob?.sdg_id ?? null,
				};
			}),
		);

		res.status(200).json(approvedTeamsWithProblemDetails);
	} catch (error) {
		console.log(error);
		res.status(500).json({ error });
	}
};

export const updateTeamScore = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { team_id, judge_id, round_id, category_id, score } = req.body as {
			team_id: string;
			judge_id: string;
			category_id: string;
			score: number;
			round_id: string;
			category_scores: { category_id: string; score: number }[];
		};

		if (score < 0) {
			throw new Error("Score must be a positive number");
		}

		const team = await Team.findById(team_id);
		if (!team) {
			throw new Error("Team not found");
		}

		let judgeScore = team.judge_score.find(
			(j) => j.judge_id.toString() === judge_id.toString(),
		);

		if (!judgeScore) {
			judgeScore = new JudgeScore({
				judge_id,
				scores: [{ round_id, category_scores: [{ category_id, score }] }],
			});
			team.judge_score.push(judgeScore);
		} else {
			const roundScore = judgeScore.scores.find(
				(r) => r.round_id.toString() === round_id,
			);

			if (!roundScore) {
				judgeScore.scores.push({
					round_id: new mongoose.Types.ObjectId(round_id),
					category_scores: [{ category_id: category_id, score }],
				});
			} else {
				const categoryScore = roundScore.category_scores.find(
					(c) => c.category_id.toString() === category_id,
				);

				if (categoryScore) {
					categoryScore.score = score;
				} else {
					roundScore.category_scores.push({ category_id: category_id, score });
				}
			}
		}

		await team.save();
		res.status(200).json({ message: "Team score updated successfully", team });
	} catch (error) {
		next(error);
	}
};

export const getAllRounds = async (
	_req: Request,
	res: Response,
): Promise<void> => {
	try {
		const rounds = await Round.find();
		res.status(200).json(rounds);
	} catch (error) {
		console.log(error);
		res.status(500).json({ error });
	}
};

export const updateTeamDeployStatus = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { teamId, deployed } = req.body as Record<string, string>;
		const team = await Team.findById(teamId);
		if (!team) {
			throw new Error("Team not found");
		}

		team.deployed = deployed.toString().toLocaleLowerCase() === "true";

		await Team.updateOne({ _id: teamId }, team);

		res.status(200).send("Deploy status updated successfully");
	} catch (err) {
		console.log(err);
		next(err);
	}
};

export const getAverageDenominatorConfig = async (
	_req: Request,
	res: Response,
): Promise<void> => {
	try {
		const averageDenominatorConfig = await Config.findOne(
			{ key: "average_denominator" },
			"-_id",
		);
		res.status(200).json(averageDenominatorConfig);
	} catch (error) {
		console.log(error);
		res.status(500).json({ error });
	}
};

export const getMyProblems = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const userId = req.session.userId;
		if (!userId) {
			throw new Error("User ID is required");
		}
		const user = await User.findOne({ _id: userId });
		console.log(user);
		if (!user?.problem_statement || !Array.isArray(user.problem_statement)) {
			res.status(200).json([]);
			return;
		}
		const problemIds = user.problem_statement.map(
			(id) => new mongoose.Types.ObjectId(id),
		);
		const problems = await Problem.find({ _id: { $in: problemIds } });
		res.status(200).json(problems);
	} catch (error) {
		res.status(500).json({ error });
	}
};
