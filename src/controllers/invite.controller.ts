import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from "../models/exceptions";
import Team, { TEAM_LIMIT } from "../models/Team/team";
import User from "../models/User/user";
import Invite, { InviteType } from "../models/Invite";

export const inviteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { teamId, userId } = req.body as { teamId: string; userId: string };

    const team = await Team.findById(teamId);

    if (!team || team.team_leader.toString() !== req.session.userId) {
      throw new ForbiddenException(
        "Team not found, or user is not the team leader"
      );
    }
    if (team.members.length >= TEAM_LIMIT) {
      throw new ForbiddenException("Team is full");
    }

    const userCurrent = await User.findById(req.session.userId);
    if (!userCurrent) {
      throw new BadRequestException("User not found");
    }

    const userToBeInvited = await User.findById(userId);
    if (!userToBeInvited) {
      throw new BadRequestException("User to be invited not found");
    }

    if (!userCurrent.college.equals(userToBeInvited.college)) {
      throw new ForbiddenException("Both users must be from same college");
    }

    const check = await Team.findOne({ members: userId });
    if (check) {
      throw new ConflictException("User is already part of a team");
    }

    const existingInvite = await Invite.findOne({ team: teamId, user: userId });
    if (existingInvite) {
      throw new ConflictException("Invite already exists");
    }

    const newInvite = new Invite({
      team: teamId,
      user: userId,
      type: InviteType.OUTGOING,
    });

    await newInvite.save();

    res.status(201).json({ message: "Invite sent successfully" });
  } catch (error) {
    next(error);
  }
};

export const cancelInvite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { inviteId } = req.body as { inviteId: string };

    const existingInvite = await Invite.findById(inviteId);
    if (!existingInvite) {
      throw new BadRequestException("Invite not found.");
    }
    if (existingInvite.type !== InviteType.OUTGOING) {
      throw new BadRequestException("Invite is not an outgoing invite");
    }

    const team = await Team.findById(existingInvite.team);
    if (!team || team.team_leader.toString() !== req.session.userId) {
      throw new ForbiddenException(
        "Team not found, or user is not the team leader"
      );
    }

    await Invite.findByIdAndDelete(inviteId);

    res.status(200).json({ message: "Invite cancelled successfully" });
  } catch (error) {
    next(error);
  }
};

export const sendJoinRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { teamId } = req.body as { teamId: string };
    const userId = req.session.userId;

    const team = await Team.findById(teamId);
    if (!team) {
      throw new BadRequestException("Team not found");
    }
    if (team.members.length >= TEAM_LIMIT) {
      throw new ForbiddenException("Team is full");
    }

    const userCurrent = await User.findById(req.session.userId);
    if (!userCurrent) {
      throw new BadRequestException("User not found");
    }

    const userToSendRequestTo = await User.findById(userId);
    if (!userToSendRequestTo) {
      throw new BadRequestException("User to be invited not found");
    }

    if (!userCurrent.college.equals(team.college)) {
      throw new ForbiddenException("Both users must be from same college");
    }

    const check = await Team.findOne({ members: userId });
    if (check) {
      throw new ConflictException("User is already part of a team");
    }

    const existingInvite = await Invite.findOne({
      team: teamId,
      user: req.session.userId,
    });
    if (existingInvite) {
      throw new ConflictException("Invite already exists");
    }

    const newInvite = new Invite({
      team: teamId,
      user: req.session.userId,
      type: InviteType.INCOMING,
    });
    await newInvite.save();

    res.status(201).json({ message: "Join request sent successfully" });
  } catch (error) {
    next(error);
  }
};

export const cancelJoinRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { inviteId } = req.body as { inviteId: string };

    const existingInvite = await Invite.findById(inviteId);
    if (
      !existingInvite ||
      existingInvite.user.toString() !== req.session.userId
    ) {
      throw new BadRequestException(
        "Invite not found, or user is not the requester"
      );
    }
    if (existingInvite.type !== InviteType.INCOMING) {
      throw new BadRequestException("Invite is not an incoming invite");
    }

    await Invite.findByIdAndDelete(inviteId);

    res.status(200).json({ message: "Join request cancelled successfully" });
  } catch (error) {
    next(error);
  }
};

export const acceptInvite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { inviteId } = req.body as { inviteId: string };

    const existingInvite = await Invite.findById(inviteId);
    if (
      !existingInvite ||
      existingInvite.user.toString() !== req.session.userId
    ) {
      throw new BadRequestException(
        "Invite not found, or user is not the invitee"
      );
    }
    if (existingInvite.type !== InviteType.OUTGOING) {
      throw new BadRequestException("Invite is not an outgoing invite");
    }

    const check = await Team.findOne({ members: req.session.userId });
    if (check) {
      throw new ConflictException("User is already part of a team");
    }

    const team = await Team.findById(existingInvite.team);
    if (!team) {
      throw new BadRequestException("Team not found");
    }
    if (team.members.length >= TEAM_LIMIT) {
      throw new ForbiddenException("Team is full");
    }

    team.members.push(new Types.ObjectId(req.session.userId));
    await team.save();

    await Invite.deleteMany({ user: req.session.userId });

    res.status(200).json({ message: "Invite accepted successfully" });
  } catch (error) {
    next(error);
  }
};

export const rejectInvite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { inviteId } = req.body as { inviteId: string };

    const existingInvite = await Invite.findById(inviteId);
    if (
      !existingInvite ||
      existingInvite.user.toString() !== req.session.userId
    ) {
      throw new BadRequestException(
        "Invite not found, or user is not the invitee"
      );
    }
    if (existingInvite.type !== InviteType.OUTGOING) {
      throw new BadRequestException("Invite is not an outgoing invite");
    }

    await Invite.findByIdAndDelete(inviteId);

    res.status(200).json({ message: "Invite rejected successfully" });
  } catch (error) {
    next(error);
  }
};

export const acceptJoinRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { inviteId } = req.body as { inviteId: string };

    const existingInvite = await Invite.findById(inviteId);
    if (!existingInvite) {
      throw new BadRequestException(
        "Invite not found, or user is not the invitee"
      );
    }
    if (existingInvite.type !== InviteType.INCOMING) {
      throw new BadRequestException("Invite is not an incoming invite");
    }

    const team = await Team.findById(existingInvite.team);
    if (!team || team.team_leader.toString() !== req.session.userId) {
      throw new BadRequestException(
        "Team not found, or user is not the team leader"
      );
    }
    if (team.members.length >= TEAM_LIMIT) {
      throw new ForbiddenException("Team is full");
    }

    const check = await Team.findOne({ members: existingInvite.user });
    if (check) {
      throw new ConflictException("User is already part of a team");
    }

    team.members.push(new Types.ObjectId(existingInvite.user));
    await team.save();

    await Invite.deleteMany({ user: existingInvite.user });

    res.status(200).json({ message: "Join request accepted successfully" });
  } catch (error) {
    next(error);
  }
};

export const rejectJoinRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { inviteId } = req.body as { inviteId: string };

    const existingInvite = await Invite.findById(inviteId);
    if (!existingInvite) {
      throw new BadRequestException(
        "Invite not found, or user is not the invitee"
      );
    }
    if (existingInvite.type !== InviteType.INCOMING) {
      throw new BadRequestException("Invite is not an incoming invite");
    }

    const team = await Team.findById(existingInvite.team);
    if (!team || team.team_leader.toString() !== req.session.userId) {
      throw new BadRequestException(
        "Team not found, or user is not the team leader"
      );
    }

    await Invite.findByIdAndDelete(inviteId);

    res.status(200).json({ message: "Join request rejected successfully" });
  } catch (error) {
    next(error);
  }
};

export const getInvites = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const invites = await Invite.find({ user: req.session.userId })
      .populate("team", "_id name")
      .populate({
        path: "team",
        populate: { path: "team_leader", select: "_id username email" },
      });

    res.status(200).json(invites);
  } catch (error) {
    next(error);
  }
};

export const getTeamInvites = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const team = await Team.findOne({ team_leader: req.session.userId });
    if (!team) {
      throw new BadRequestException(
        "Team not found or user is not the team leader"
      );
    }

    const invites = await Invite.find({ team: team._id }).populate(
      "user",
      "_id username email"
    );

    res.status(200).json(invites);
  } catch (error) {
    next(error);
  }
};
