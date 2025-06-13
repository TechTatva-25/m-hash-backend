import type { NextFunction, Request, Response } from "express";
import type { UploadedFile } from "express-fileupload";
import { Types } from "mongoose";

import type { ITeam } from "../models/Team/team";
import type { IUser } from "../models/User/user";

import { BadRequestException, ConflictException } from "../models/exceptions";
import Submission, { SubmissionStatus } from "../models/Submission/submission";
import Team from "../models/Team/team";
import User from "../models/User/user";
import College from "../models/College/college";
import Progress from "../models/Progress/progress";
import Invite from "../models/Invite";
import Stage, { Stages } from "../models/Stage/stage";
import Problem from "../models/Problem/problem";
import RuntimeConfig from "../models/Config/config";

import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import fileUpload from "express-fileupload";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export const getTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const team = await Team.findOne({ members: req.session.userId })
      .populate("team_leader")
      .populate("members")
      .lean();

    if (!team) {
      throw new BadRequestException("User is not part of any team");
    }

    res.status(200).json(await buildTeamResponse(req, team, false));
  } catch (error) {
    next(error);
  }
};

export const createTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body as { name: string };
    const team_leader = req.session.userId;
    const existingTeam = await Team.findOne({ members: team_leader });

    if (existingTeam) {
      throw new ConflictException("User is already part of a team");
    }

    const user = await User.findById(team_leader);
    if (!user) {
      throw new ConflictException("User not found");
    }

    const college = await College.findById(user.college);
    if (!college) throw new BadRequestException("User's college not found");

    const teamAlreadyPresent = await Team.findOne({
      name: new RegExp(`^${name}$`, "i"),
    });
    if (teamAlreadyPresent) {
      throw new ConflictException(
        "Team name has been taken. Please choose a different name"
      );
    }

    const team = new Team({
      name,
      team_leader,
      members: [team_leader],
      college: user.college,
      collegeOther: user.collegeOther,
    });

    await Progress.createInitialProgress(team._id as Types.ObjectId);
    await team.save();

    res.status(201).json({ message: "Team created successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const team = await Team.findOne({ team_leader: req.session.userId });
    if (!team) {
      throw new BadRequestException("User is not the team leader of any team");
    }

    await Team.findByIdAndDelete(team._id);

    const submission = await Submission.findOne({ team_id: team._id });
    if (submission) {
      // const file_name = submission.submission_file_name;

      // TODO: AWS S3 configuration and uncomment the following code block
      // const response = await deleteFile(file_name, true);
      // if (!response) {
      // 	throw new BadRequestException(`Error deleting submission PPT: ${file_name}}`);
      // }

      await Submission.findByIdAndDelete(submission._id);
    }

    await Invite.deleteMany({ team: team._id });

    res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const leaveTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const team = await Team.findOne({ members: req.session.userId });
    if (!team) {
      throw new BadRequestException("User is not part of any team");
    }

    if (team.team_leader.toString() === req.session.userId) {
      throw new BadRequestException(
        "Team leader cannot leave the team, disband the team instead"
      );
    }

    team.members = team.members.filter(
      (member) => member.toString() !== req.session.userId
    );
    if (team.members.length < 2) {
      const submission = await Submission.findOne({ team_id: team._id });

      if (submission) {
        throw new ConflictException(
          "Your team has already submitted the PPT. Leaving the team would violate the minimum team member requirement. If you wish to leave this team, please ask your team leader to delete this team's submission."
        );
      }
    }

    await team.save();

    res.status(200).json({ message: "Left team successfully" });
  } catch (error) {
    next(error);
  }
};

export const listTeams = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    let offset = parseInt(req.query.offset as string) || 0;
    if (limit > 1000 || limit < 0) {
      throw new BadRequestException("Limit must be between 0 and 1000");
    }

    const options: Record<
      string,
      string | { $regex: string; $options: string }
    > = {};

    const name = (req.query.team_name as string) || "";
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

    const teams = await Team.find(options)
      .limit(limit)
      .skip(offset)
      .populate("team_leader")
      .populate("members")
      .lean();

    const formatted = await Promise.all(
      teams.map(async (team) => await buildTeamResponse(req, team, true))
    );

    res.status(200).json({
      limit,
      offset,
      total,
      teams: formatted,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { teamId, memberId } = req.body as {
      teamId: string;
      memberId: string;
    };

    const team = await Team.findById(teamId);

    if (!team) {
      throw new BadRequestException("Team not found");
    }

    if (team.team_leader.toString() !== req.session.userId) {
      throw new BadRequestException("User is not the team leader");
    }

    if (team.team_leader.toString() === memberId) {
      throw new BadRequestException("Team leader cannot be removed");
    }

    team.members = team.members.filter(
      (member) => member.toString() !== memberId
    );

    await team.save();

    res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    next(error);
  }
};

export const getProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const team = await Team.findOne({ members: req.session.userId });
    if (!team) {
      throw new BadRequestException("User is not part of any team");
    }

    let progress = await Progress.findOne({ team: team._id });
    if (!progress) {
      await Progress.createInitialProgress(team._id as Types.ObjectId);
      progress = await Progress.findOne({ team: team._id });
    }

    res.status(200).json(await progress?.getProgress());
  } catch (error) {
    next(error);
  }
};

export const listStages = async (
  _: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stages = await Stage.find({ stage: { $in: Object.values(Stages) } });
    res.status(200).json(stages);
  } catch (error) {
    next(error);
  }
};

export const makeSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const team = await Team.findOne({ members: req.session.userId });

    if (!team) {
      throw new BadRequestException("User is not part of any team");
    }

    if (team.team_leader.toString() !== req.session.userId) {
      throw new BadRequestException("Only team leader can make submissions");
    }

    if (team.members.length < 2) {
      throw new BadRequestException("A team must have at least 2 members");
    } else if (team.members.length > 5) {
      throw new BadRequestException("Teams cannot have more than 5 members");
    }

    const check = await Submission.findOne({ team_id: team._id });

    if (check) {
      throw new BadRequestException("Submission already exists");
    }

    const { problem_id, video_url } = req.body;

    const problem = await Problem.findById(problem_id);
    if (!problem) {
      throw new BadRequestException("Problem not found");
    }

    const file = req.files?.file as UploadedFile | undefined;
    if (!file) {
      throw new BadRequestException("File not found");
    }

    const file_name = `${problem_id}_${(team._id as Types.ObjectId).toString()}_${file.name.trim()}`;

    // // TODO: AWS S3 configuration and uncoment the following code block
    // const response = await putFile(file_name, file.data, true);
    // if (!response) {
    //   throw new BadRequestException("Error uploading PPT");
    // }

    // // ---- Video Submission ----
    // const video = req.files?.video as fileUpload.UploadedFile | undefined;
    // if (video) {
    //  const video_file_name = `${problem_id}_${(team._id as mongoose.Types.ObjectId).toString()}_${video.name}`;
    //  const response = await putFile(video_file_name, video.data, false);
    //  if (!response) {
    //      throw new BadRequestException("Error uploading video");
    //  }

    const pptUrl = await uploadToCloudinary(file.data, file_name, 'submissions');

    const video = req.files?.video as fileUpload.UploadedFile | undefined;
    let videoUrl = video_url;
    if (video) {
      const originalVideoName = video.name.replace(/\s+/g, "_").replace(/(\.mp4)+$/i, "");
      const video_file_name = `${problem_id}_${team._id}_${originalVideoName}`;
      videoUrl = await uploadToCloudinary(video.data, video_file_name, 'videos');
    }

     const submission = new Submission({
      problem_id: problem._id,
      team_id: team._id,
      submission_file_name: file.name.trim(),
      submission_url: pptUrl,
      submission_video_url: videoUrl,
    });

     await submission.save();
    
    res.status(201).json({ message: "Submission created successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const team = await Team.findOne({ members: req.session.userId });
    if (!team) {
      throw new BadRequestException("User is not part of any team");
    } else if (!team.team_leader.equals(req.session.userId)) {
      throw new BadRequestException("Only team leader can delete submissions");
    }

    const submission = await Submission.findOne({ team_id: team._id });
    if (!submission) {
      throw new BadRequestException("Submission not found");
    }

    const submission_team = await Team.findById(submission.team_id);
    if (!submission_team) {
     throw new BadRequestException("Submission team not found");
    }

    if (submission_team.team_leader.toString() !== req.session.userId) {
     throw new BadRequestException("Only team leader can delete submissions");
    }

    // const file_name = submission.submission_file_name;

    // TODO: AWS S3 configuration and uncoment the following code block
    // const response = await deleteFile(file_name, true);
    // if (!response) {
    //   throw new BadRequestException(
    //     `Error deleting submission PPT: ${file_name}}`
    //   );
    // }

    // ---- Video Submission ----
    // const submission_video_file_name = submission.submission_video_file_name;
    // const response2 = await deleteFile(submission_video_file_name, false);
    // if (!response2) {
    //     throw new BadRequestException(`Error deleting submission video: ${submission_video_file_name}}`);
    // }

    // Delete PPT from Cloudinary
    const pptPublicId = extractPublicId(submission.submission_url);
    const result = await cloudinary.uploader.destroy(pptPublicId, {
      resource_type: 'raw',
      invalidate: true,
    });
    console.log("Delete result:", result);

    // Delete video from Cloudinary if it's a URL (not a manual link)
    if (submission.submission_video_url?.includes("cloudinary")) {
      const videoPublicId = extractPublicId(submission.submission_video_url);
      console.log(videoPublicId)
      const resultVideo = await cloudinary.uploader.destroy(videoPublicId, {
        resource_type: "video",
        invalidate: true,
      });
      console.log("Video Delete result:", resultVideo);
    }

    await Submission.findByIdAndDelete(submission._id);

    res.status(200).json({ message: "Submission deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const team = await Team.findOne({ members: req.session.userId });
    if (!team) {
      throw new BadRequestException("User is not part of any team");
    }

    const submission = await Submission.findOne({ team_id: team._id });
    if (!submission) {
      throw new BadRequestException("Submission not found");
    }

    // TODO: AWS S3 configuration and uncoment the following code block
    // const getFileResponse = await getFile(submission.submission_file_name, true);
    // if (!getFileResponse.submissionUrl) {
    // 	throw new BadRequestException("Submission URL fetch failure for PPT");
    // }
    // submission.submission_url = getFileResponse.submissionUrl;

    // ---- Video Submission ----
    // const submission_video_file_name = submission.submission_video_file_name;
    // if (submission_video_file_name) {
    //     const getFileResponse = await getFile(submission.submission_video_file_name, false);
    //     if (!getFileResponse.submissionUrl) {
    //         throw new BadRequestException("Submission URL fetch failure for video");
    //     }
    //     submission.submission_video_url = getFileResponse.submissionUrl;
    // }

    const config = await RuntimeConfig.findOne(
      { key: "release_results" },
      "-_id"
    );

    if (!config) {
      throw new ConflictException("Config not found");
    }

    if (config.value) {
      if (submission.status === SubmissionStatus.ADMIN_APPROVED) {
        submission.status = SubmissionStatus.DISPLAY_QUALIFIED;
      } else {
        submission.status = SubmissionStatus.DISPLAY_REJECTED;
      }
    } else {
      submission.status = SubmissionStatus.DISPLAY_UNDER_EVAL;
    }

    res.status(200).json(submission);
  } catch (error) {
    next(error);
  }
};

const buildTeamResponse = async (
  req: Request,
  team: ITeam,
  hideSensitive: boolean
): Promise<object> => {
  const isAdmin = req.session.role === "admin";

  const submission = isAdmin
    ? await Submission.findOne({ team_id: team._id })
    : null;

  let progress = "Registered";

  if (isAdmin && submission) {
    switch (submission.status) {
      case SubmissionStatus.ADMIN_APPROVED:
        progress = SubmissionStatus.DISPLAY_QUALIFIED;
        break;
      case SubmissionStatus.ADMIN_REJECTED:
        progress = SubmissionStatus.DISPLAY_REJECTED;
        break;
      case SubmissionStatus.PENDING:
        progress = "Submitted";
        break;
      default:
        progress = "Registered";
    }
  }

  const scrubMember = (member: IUser) => {
    const {
      password,
      token,
      email,
      mobile_number,
      gender,
      verified,
      role,
      ...safeFields
    } = member;

    return {
      ...safeFields,
      college: member.collegeOther,
      ...(isAdmin || !hideSensitive ? { email, mobile_number } : {}),
    };
  };

  const teamLeader = team.team_leader as unknown as IUser;

  const safeTeamLeader = {
    _id: teamLeader._id,
    username: teamLeader.username,
    college: team.collegeOther,
    ...(isAdmin || !hideSensitive
      ? {
          email: teamLeader.email,
          mobile_number: teamLeader.mobile_number,
        }
      : {}),
  };

  return {
    _id: team._id,
    name: team.name,
    members: (team.members as unknown as IUser[]).map(scrubMember),
    team_leader: safeTeamLeader,
    college: team.collegeOther,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
    progress,
  };
};

function uploadToCloudinary(buffer: Buffer, publicId: string, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export const extractPublicId = (url: string): string => {
  return decodeURIComponent(url.split("/").slice(7).join("/"));
};



