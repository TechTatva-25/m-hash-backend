import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import { transporter } from "../libs/mails";
import Team from "../models/Team/team";
import User, { UserRoles } from "../models/User/user";
import { BadRequestException } from "../models/exceptions";
import Progress from "../models/Progress/progress";
import Submission, { SubmissionStatus } from "../models/Submission/submission";
//import { deleteFile, getFile } from "../libs/s3";
import Stage, { Stages } from "../models/Stage/stage";
import ExcelJS from "exceljs";

// for cloudinary
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const emailHtml = (content: string): string => `
    <html>
    <body>
        <p>${content}</p>
    </body>
    </html>
`;

interface TypedRequestBody<T> extends Request {
	body: T;
}

interface ProgressRequestBody {
	teamId: string;
}

export const sendTeamMail = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { teamId, mail } = req.body as Record<string, string>;
		const team = await Team.findById(teamId);
		if (!team) {
			throw new Error("Team not found");
		}
		const userIds = team.members;
		const users = await User.find({ _id: { $in: userIds } });
		const emailIds = users.map((user) => user.email);
		const sendEmails = emailIds.map((email) => {
			const mailOptions = {
				from: process.env.EMAIL_USER,
				to: email,
				subject: "Demo Mail",
				html: emailHtml(`${mail}`),
			};
			return transporter.sendMail(mailOptions);
		});
		await Promise.all(sendEmails);
		res.status(200).send("Emails sent successfully");
	} catch (error) {
		next(error);
	}
};

export const AdmingetProgress = async (
	req: TypedRequestBody<ProgressRequestBody>,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { teamId } = req.body;
		const team = await Team.findOne({ _id: teamId });
		if (!team) {
			throw new BadRequestException("Team not found");
		}
		let progress = await Progress.findOne({ team: team._id });
		if (!progress) {
			await Progress.createInitialProgress(team._id as mongoose.Types.ObjectId);
			progress = await Progress.findOne({ team: team._id });
		}
		if (progress) {
			res.status(200).json(await progress.getProgress());
		} else {
			throw new Error("Progress not found after creation");
		}
	} catch (error) {
		next(error);
	}
};

export const makeJudge = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { userId } = req.body as Record<string, string>;
		const user = await User.findById(userId);
		if (!user) {
			throw new Error("User not found");
		}
		user.role = UserRoles.JUDGE;
		user.problem_statement = [];
		await user.save();
		res.status(200).send("User role updated to judge");
	} catch (error) {
		next(error);
	}
};

export const deleteTeam = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { teamId } = req.body as Record<string, string>;
		const team = await Team.findByIdAndDelete(teamId);
		if (!team) {
			throw new Error("Team not found");
		}

		const submission = await Submission.findOne({ team_id: team._id });
		if (submission) {
			// const file_name = submission.submission_file_name;
			// const response = await deleteFile(file_name, true);
			// if (!response) {
			// 	throw new BadRequestException(`Error deleting submission PPT: ${file_name}}`);
			// }

			// await Submission.findByIdAndDelete(submission._id);
			// Delete PPT
			if (submission.submission_url?.includes("cloudinary")) {
				const pptPublicId = extractPublicId(submission.submission_url);
				const result = await cloudinary.uploader.destroy(pptPublicId, {
					resource_type: "raw",
				});
				console.log("PPT Delete result:", result);
			}

			// Delete Video
			if (submission.submission_video_url?.includes("cloudinary")) {
				const videoPublicId = extractPublicId(submission.submission_video_url);
				console.log(videoPublicId);
				const resultVideo = await cloudinary.uploader.destroy(videoPublicId, {
					resource_type: "video",
					invalidate: true,
				});
				console.log("Video Delete result:", resultVideo);
			}

			await Submission.findByIdAndDelete(submission._id);
		}

		res.status(200).send("Team deleted successfully");
	} catch (error) {
		next(error);
	}
};

export const getAllSubmissions = async (
	_req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const submissions = await Submission.find({})
			.populate("team_id", "name")
			.populate("problem_id", "title sdg_id sdg_title");
		// for (const submission of submissions) {
		// 	const getFileResponse = await getFile(
		// 		submission.submission_file_name ? submission.submission_file_name : submission.submission_url,
		// 		true
		// 	);

		// 	if (getFileResponse.submissionUrl) {
		// 		submission.submission_url = getFileResponse.submissionUrl;
		// 	} else {
		// 		submission.submission_url = "URL fetch failure";
		// 	}

		// 	const submission_video_file_name = submission.submission_video_file_name;

		// 	if (submission_video_file_name) {
		// 		const getFileResponse = await getFile(submission.submission_video_file_name, false);

		// 		if (!getFileResponse.submissionUrl) {
		// 			throw new BadRequestException("Submission URL fetch failure for video");
		// 		}

		// 		submission.submission_video_url = getFileResponse.submissionUrl;
		// 	}
		// }

		for (const submission of submissions) {
			if (!submission.submission_url) {
				submission.submission_url = "PPT URL not available";
			}

			if (!submission.submission_video_url) {
				submission.submission_video_url = "Video URL not available";
			}
		}

		res.status(200).json(submissions);
	} catch (error) {
		next(error);
	}
};

export const adminApprove = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { submissionId } = req.body as Record<string, string>;
		const submission = await Submission.findById(submissionId);
		if (!submission) {
			throw new Error("Submission not found");
		}
		submission.status = SubmissionStatus.ADMIN_APPROVED;
		await submission.save();

		const nextStage = await Stage.findOne({ stage: Stages.FINALS }, "_id");
		if (!nextStage) {
			throw new Error("Next stage not found");
		}

		await Progress.updateOne(
			{ team: submission.team_id },
			{ stage: nextStage._id },
		);

		res.status(200).send("Submission approved successfully");
	} catch (error) {
		res.status(400).send(error);
	}
};

export const adminReject = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { submissionId } = req.body as Record<string, string>;
		const submission = await Submission.findById(submissionId);
		if (!submission) {
			throw new Error("Submission not found");
		}
		submission.status = SubmissionStatus.ADMIN_REJECTED;
		await submission.save();

		const nextStage = await Stage.findOne({ stage: Stages.QUALIFIERS }, "_id");
		if (!nextStage) {
			throw new Error("Next stage not found");
		}

		await Progress.updateOne(
			{ team: submission.team_id },
			{ stage: nextStage._id },
		);

		res.status(200).send("Submission rejected successfully");
	} catch (error) {
		res.status(400).send(error);
	}
};

export const getAdminStats = async (
	_req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const users_total = await User.countDocuments({});
		const users_male = await User.countDocuments({ gender: "Male" });
		const users_female = await User.countDocuments({ gender: "Female" });
		const users_other = await User.countDocuments({ gender: "Other" });
		const teams = await Team.countDocuments({});
		const submissions = await Submission.countDocuments({});
		const colleges = new Set(
			(await Team.find({}, "collegeOther -_id")).map(
				(team) => team.collegeOther,
			),
		).size;

		const teamsByDate = await getTeamCreationCountByDate();
		const usersByDate = await getUserCreationCountByDate();

		const teamCountByCollege = await getTeamCountByCollege();
		const userCountByCollege = await getUserCountByCollege();

		const teamCountByState = await getTeamCountByState();
		// const userCountByState = await getUserCountByState();

		const teamCollegeCountByState = await getTeamCollegeCountByState();
		// const userCollegeCountByState = await getUserCollegeCountByState();

		res.status(200).send({
			users: {
				total: users_total,
				male: users_male,
				female: users_female,
				other: users_other,
			},
			teams,
			submissions,
			colleges,
			teamsByDate,
			usersByDate,
			teamCountByCollege,
			userCountByCollege,
			teamCountByState,
			// userCountByState,
			teamCollegeCountByState,
			// userCollegeCountByState,
		});
	} catch (err) {
		next(err);
	}
};

//////////////////////////////////////////// Stat Functions /////////////////////////////////////////////////////////
interface StatCount {
	_id: string;
	count: number;
}

const objectifyStat = (result: StatCount[]): { key: string; count: number }[] =>
	result.map((item: StatCount) => ({
		key: item._id,
		count: item.count,
	}));

async function getTeamCreationCountByDate(): Promise<
	{ key: string; count: number }[]
> {
	const result: StatCount[] = await Team.aggregate([
		{
			$project: {
				date: {
					$dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
				},
			},
		},
		{
			$group: {
				_id: "$date",
				count: { $sum: 1 },
			},
		},
		{
			$sort: { _id: 1 },
		},
	]);

	return objectifyStat(result);
}

async function getUserCreationCountByDate(): Promise<
	{ key: string; count: number }[]
> {
	const result: StatCount[] = await User.aggregate([
		{
			$project: {
				date: {
					$dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
				},
			},
		},
		{
			$group: {
				_id: "$date",
				count: { $sum: 1 },
			},
		},
		{
			$sort: { _id: 1 },
		},
	]);

	return objectifyStat(result);
}

async function getTeamCountByCollege(): Promise<
	{ key: string; count: number }[]
> {
	const result: StatCount[] = await Team.aggregate([
		{
			$group: {
				_id: "$collegeOther",
				count: { $sum: 1 },
			},
		},
		{
			$sort: { _id: 1 },
		},
	]);

	return objectifyStat(result);
}

async function getUserCountByCollege(): Promise<
	{ key: string; count: number }[]
> {
	const result: StatCount[] = await User.aggregate([
		{
			$group: {
				_id: "$collegeOther",
				count: { $sum: 1 },
			},
		},
		{
			$sort: { _id: 1 },
		},
	]);

	return objectifyStat(result);
}

async function getTeamCountByState(): Promise<
	{ key: string; count: number }[]
> {
	const result: StatCount[] = await Team.aggregate([
		{
			$lookup: {
				from: "colleges",
				localField: "college",
				foreignField: "_id",
				as: "join",
			},
		},
		{
			$unwind: "$join",
		},
		{
			$group: {
				_id: "$join.state",
				count: { $sum: 1 },
			},
		},
		{
			$sort: { _id: 1 },
		},
	]);

	return objectifyStat(result);
}

async function getTeamCollegeCountByState(): Promise<
	{ key: string; count: number }[]
> {
	const result: StatCount[] = await Team.aggregate([
		{
			$lookup: {
				from: "colleges",
				localField: "college",
				foreignField: "_id",
				as: "join",
			},
		},
		{
			$unwind: "$join",
		},
		{
			$group: {
				_id: "$join.state",
				colleges: { $addToSet: "$join._id" },
			},
		},
		{
			$project: {
				_id: 1,
				count: { $size: "$colleges" },
			},
		},
		{
			$sort: { _id: 1 },
		},
	]);

	return objectifyStat(result);
}
//////////////////////////////////////////// Stat Functions /////////////////////////////////////////////////////////

export const getAllJudges = async (
	_req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const judges = await User.find({ role: UserRoles.JUDGE });
		res.status(200).json(judges);
	} catch (error) {
		next(error);
	}
};

export const assignProblem = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { userId, problemId } = req.body as Record<string, string[]>;
		const user = await User.findById(userId);
		if (!user) {
			throw new Error("User not found");
		}
		if (user.role !== UserRoles.JUDGE) {
			throw new Error("User is not a judge");
		}
		if (!user.problem_statement) {
			user.problem_statement = [];
		}
		const newProblems = problemId.filter(
			(id) => !user.problem_statement?.includes(id),
		);
		if (newProblems.length === 0) {
			res.status(400).send("No new problems to assign");
		}
		user.problem_statement = [...user.problem_statement, ...newProblems];
		await user.save();
		res.status(200).send("Problem assigned successfully");
	} catch (error) {
		next(error);
	}
};

export const deassignProblem = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { userId, problemId } = req.body as Record<string, string>;
		const user = await User.findById(userId);
		if (!user) {
			throw new Error("User not found");
		}
		if (user.role !== UserRoles.JUDGE) {
			throw new Error("User is not a judge");
		}
		if (!user.problem_statement) {
			throw new Error("User has no problems assigned");
		}
		const problems = user.problem_statement.filter((id) => id !== problemId);
		if (problems.length === user.problem_statement.length) {
			res.status(400).send("Problem not assigned to user");
		}
		user.problem_statement = problems;
		await user.save();
		res.status(200).send("Problem deassigned successfully");
	} catch (error) {
		next(error);
	}
};

export const getTeamJudgeMapping = async (
	_req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const judges = await User.find({ role: "judge" }, "problem_statement _id");

		const teamJudges: Record<string, string[]> = {};

		for (const judge of judges) {
			const teams = await Submission.find({
				problem_id: { $in: judge.problem_statement ?? [] },
			});
			for (const team of teams) {
				const tidx = team.team_id.toString();
				if (tidx in teamJudges) {
					teamJudges[tidx].push(
						(judge._id as mongoose.Types.ObjectId).toString(),
					);
				} else {
					teamJudges[tidx] = [
						(judge._id as mongoose.Types.ObjectId).toString(),
					];
				}
			}
		}

		res.status(200).json({ teamJudges });
	} catch (error) {
		next(error);
	}
};

export const exportSubmissionsToExcel = async (
	_req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const submissions = await Submission.find({})
			.populate<{
				team_id: { name: string };
				problem_id: { title: string; sdg_id: string; sdg_title: string };
			}>("team_id", "name")
			.populate<{
				problem_id: { title: string; sdg_id: string; sdg_title: string };
			}>("problem_id", "title sdg_id sdg_title");

		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Submissions");

		// Define headers
		worksheet.columns = [
			{ header: "Team Name", key: "teamName", width: 25 },
			{ header: "Problem Title", key: "problemTitle", width: 30 },
			{ header: "SDG ID", key: "sdgId", width: 10 },
			{ header: "SDG Title", key: "sdgTitle", width: 30 },
			{ header: "PPT URL", key: "pptUrl", width: 50 },
			{ header: "Video URL", key: "videoUrl", width: 50 },
			{ header: "Status", key: "status", width: 20 },
		];

		for (const submission of submissions) {
			worksheet.addRow({
				teamName: submission.team_id?.name || "N/A",
				problemTitle: submission.problem_id?.title || "N/A",
				sdgId: submission.problem_id?.sdg_id || "N/A",
				sdgTitle: submission.problem_id?.sdg_title || "N/A",
				pptUrl: submission.submission_url || "N/A",
				videoUrl: submission.submission_video_url || "N/A",
				status: submission.status || "N/A",
			});
		}

		// Set headers
		res.setHeader(
			"Content-Disposition",
			"attachment; filename=submissions.xlsx",
		);
		res.setHeader(
			"Content-Type",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		);

		await workbook.xlsx.write(res);
		res.end();
	} catch (err) {
		next(err);
	}
};

export const sendAdminMessage = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { userId, message } = req.body as Record<string, string>;

		if (!userId || !message) {
			throw new BadRequestException("userId and message are required.");
		}

		const user = await User.findById(userId);
		if (!user) {
			throw new BadRequestException("User not found.");
		}

		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: user.email,
			subject: "Response to Your Ticket",
			html: emailHtml(message),
		};

		await transporter.sendMail(mailOptions);
		res.status(200).send("Message sent successfully.");
	} catch (error) {
		next(error);
	}
};


export const extractPublicId = (url: string): string => {
	return decodeURIComponent(url.split("/").slice(7).join("/"));
};
