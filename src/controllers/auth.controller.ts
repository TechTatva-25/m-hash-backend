import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import axios from "axios";

import {
  sendForgotPasswordEmail,
  sendOTPVerificationEmail,
  SignType,
} from "../libs/mails";
import College from "../models/College/college";
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from "../models/exceptions";
import Submission, { SubmissionStatus } from "../models/Submission/submission";
import Team from "../models/Team/team";
import User from "../models/User/user";
import bcrypt from "bcrypt";
export interface queryProps {
  $or?: Record<string, { $regex: string; $options: string }>[];
  college?: string;
  collegeOther?: string;
  verified?: boolean;
}


interface BugHistory {
  score: number;
  bug_count: number;
}

interface LeaderboardRecord {
  name: string;
  bugs: BugHistory[];
}

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /**
   * Expects a request body with the following fields:
   * - email: string
   * - username: string
   * - password: string
   * - mobile_number: string
   * - college: ObjectId
   *
   * Creates a new user with the given email, username, and password, and sends a verification email.
   *
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   *
   * @returns {Promise<void>}
   */
  try {
    const {
      email,
      username,
      password,
      mobile_number,
      college,
      collegeOther,
      gender,
      turnstileToken,
    } = req.body as Record<string, string>;

    if (!turnstileToken) {
      throw new BadRequestException(
        "CAPTCHA verification failed. Please try again."
      );
    }
    const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    if (!secret) {
      throw new Error(
        "Cloudflare Turnstile secret key not set in environment variables."
      );
    }
    try {
      const params = new URLSearchParams({
        secret,
        response: turnstileToken,
        remoteip: req.ip || "",
      });
      const verifyRes = await axios.post(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        params,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      if (!verifyRes.data.success) {
        throw new BadRequestException(
          "CAPTCHA verification failed. Please try again."
        );
      }
    } catch (err) {
      return next(
        new BadRequestException(
          "CAPTCHA verification failed. Please try again."
        )
      );
    }

    // const token = jwt.sign({ email, type: SignType.VERIFICATION }, process.env.JWT_SECRET ?? "secret", {
    // 	expiresIn: "1d",
    // });

    const collegeResp = await College.findById(college);
    if (!collegeResp) throw new BadRequestException("College not found");
    const collegeName = collegeOther ? collegeOther : collegeResp.name;
    const user = new User({
      email,
      username,
      password,
      mobile_number,
      college,
      collegeOther: collegeName,
      gender,
    }) as mongoose.Document & { _id: mongoose.Types.ObjectId };
    await user.save();
    // await sendVerificationEmail(email, token);
    await sendOTPVerificationEmail(
      email,
      (user._id as mongoose.Types.ObjectId).toString()
    );
    res.status(201).send({ message: "User created" });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /**
   * Expects a request body with the following fields:
   * - email: string
   * - password: string
   *
   * Logs in the user with the given email and password and sets the session.
   *
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   *
   * @returns {Promise<void>}
   */
  try {
    if (req.session.userId) {
      throw new UnauthorizedException("Already logged in");
    }
    const { email, password, turnstileToken } = req.body as Record<
      string,
      string
    >;
    if (!turnstileToken) {
      throw new BadRequestException(
        "CAPTCHA verification failed. Please try again."
      );
    }
    const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    if (!secret) {
      throw new Error(
        "Cloudflare Turnstile secret key not set in environment variables."
      );
    }
    try {
      const params = new URLSearchParams({
        secret, // guaranteed string
        response: turnstileToken, // guaranteed string
        remoteip: req.ip || "", // always a string
      });

      const verifyRes = await axios.post(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        params,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      if (!verifyRes.data.success) {
        throw new BadRequestException(
          "CAPTCHA verification failed. Please try again."
        );
      }
    } catch (err) {
      return next(
        new BadRequestException(
          "CAPTCHA verification failed. Please try again."
        )
      );
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedException("No such user found");
    }
    if (!user.verified) {
      throw new UnauthorizedException(
        "User not verified, please check your email"
      );
    }
    const isValid = await user.validPassword(password);
    if (!isValid) {
      throw new UnauthorizedException("Invalid password");
    }
    req.session.userId = (user._id as mongoose.Types.ObjectId).toHexString();
    req.session.username = user.username;
    req.session.role = user.role;
    res.status(200).send({ message: "Logged in" });
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /**
   * Logs out the user by destroying the session.
   *
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   *
   * @returns {Promise<void>}
   */
  try {
    req.session.destroy((err) => {
      if (err) {
        throw err;
      }
      res.status(200).send({ message: "Logged out" });
    });
  } catch (err) {
    next(err);
  }
};

export const me = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /**
   * Returns the user object of the currently logged in user, requires authentication and account verification.
   *
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   *
   * @returns {Promise<void>}
   */
  try {
    const user = await User.findById(req.session.userId).lean();
    if (!user) {
      throw new UnauthorizedException("No such user found");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, otp, collegeOther, ...rest } = user;

    res.status(200).send({ ...rest, college: user.collegeOther });
  } catch (err) {
    next(err);
  }
};

export const sendVerificationMail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /**
   * Expects a request body with the following fields:
   * - email: string
   *
   * Sends a verification email to the user with the given email.
   *
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   *
   * @returns {Promise<void>}
   */
  try {
    const { email } = req.body as Record<string, string>;
    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedException("No such user found");
    }
    if (user.verified) {
      throw new UnauthorizedException("User already verified");
    }

    // Use the centralized OTP generation and email sending function
    await sendOTPVerificationEmail(
      email,
      (user._id as mongoose.Types.ObjectId).toString()
    );
    res.status(200).send({ message: "Verification email sent" });
  } catch (err) {
    next(err);
  }
};


export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /**
   *
   * Verifies the email of the user with the given OTP and sets the verified flag to true.
   *
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   *
   * @returns {Promise<void>}
   */
  try {
    const { email, otp } = req.body as Record<string, string>;

    if (!email || !otp) {
      throw new BadRequestException("Email and OTP are required");
    }

    const user = await User.findOne({ email });

    if (!user) throw new UnauthorizedException("No such user found");

    if (user.verified) {
      res.status(200).send({ message: "Email already verified" });
      return;
    }

    if (!user.otp || !user.otpExpiresAt) {
      throw new UnauthorizedException(
        "No OTP found. Please request a new verification code"
      );
    }

    // Check if the OTP is expired
    if (user.otpExpiresAt.getTime() < Date.now()) {
      user.otp = undefined;
      user.otpExpiresAt = undefined;
      await user.save();
      throw new UnauthorizedException(
        "OTP has expired. Please request a new verification code"
      );
    }

    // Verify the OTP
    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch)
      throw new UnauthorizedException(
        "Invalid OTP. Please check and try again"
      );

    // Mark user as verified and clear OTP data
    user.verified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.status(200).send({ message: "Email verified successfully" });
  } catch (err) {
    next(err);
  }

};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /**
   * Expects a request body with the following fields:
   * - email: string
   *
   * Sends a forgot password email to the user with the given email.
   *
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   *
   * @returns {Promise<void>}
   */
  try {
    const { email } = req.body as Record<string, string>;
    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedException("No such user found");
    }
    const token = jwt.sign(
      { email, type: SignType.FORGOT_PASSWORD },
      process.env.JWT_SECRET ?? "secret",
      {
        expiresIn: "1d",
      }
    );
    user.token = token;
    await user.save();
    await sendForgotPasswordEmail(email, token);
    res.status(200).send({ message: "Email sent" });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /**
   * Expects a request body with the following fields:
   * - password: string
   * - token: string
   *
   * Verifies the token and resets the password of the user with the given token.
   *
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   *
   * @returns {Promise<void>}
   */
  try {
    const { password, token } = req.body as Record<string, string>;
    let decoded: Record<string, string> & { type: SignType };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET ?? "secret") as Record<
        string,
        string
      > & {
        type: SignType;
      };
    } catch (err) {
      throw new UnauthorizedException("Invalid token");
    }
    if (decoded.type !== SignType.FORGOT_PASSWORD) {
      throw new UnauthorizedException("Invalid token");
    }
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      throw new UnauthorizedException("No such user found");
    }
    if (!user.token || user.token !== token) {
      throw new UnauthorizedException("Invalid token");
    }
    user.password = password;
    user.token = undefined;
    await user.save();
    res.status(200).send({ message: "Password reset" });
  } catch (err) {
    next(err);
  }
};

export const listUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    let offset = parseInt(req.query.offset as string) || 0;
    const username = (req.query.username as string) || "";
    const email = (req.query.email as string) || "";
    if (limit < 0 || limit > 3000) {
      throw new BadRequestException("Limit must be between 0 and 3000");
    }
    const options: Record<string, { $regex: string; $options: string }>[] = [];
    if (username) {
      options.push({ username: { $regex: username, $options: "i" } });
    }
    if (email) {
      options.push({ email: { $regex: email, $options: "i" } });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      throw new ConflictException("User not found");
    }

    const query: queryProps = {
  ...(options.length ? { $or: options } : {}),
  verified: true,
};


    if (req.session.role === "user") {
      query.college = user.college.toString();
    }

    const total = await User.countDocuments(query);
    if (offset > total || offset < 0) {
      offset = limit > total ? 0 : total - limit;
    }
    const users = await User.find(query).limit(limit).skip(offset).lean();

    if (req.session.role === "admin") {
      const usersWithoutCreds = await Promise.all(
        users.map(async (user) => {
          const college = await College.findById(user.college);
          if (!college) {
            throw new BadRequestException("User's college not found");
          }

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, token, ...rest } = user;

          return { ...rest, collegeState: college.state };
        })
      );

      res.status(200).send({
        limit,
        offset,
        total,
        users: usersWithoutCreds,
        hasMore: offset + limit < total,
      });
    } else {
      const usersWithoutSensitiveDetails = users.map((user) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {
          password,
          token,
          email,
          mobile_number,
          gender,
          verified,
          role,
          ...rest
        } = user;
        return rest;
      });

      res.status(200).send({
        limit,
        offset,
        total,
        users: usersWithoutSensitiveDetails,
        hasMore: offset + limit < total,
      });
    }
  } catch (err) {
    next(err);
  }
};

export const getHomepageStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await User.countDocuments({});
    const teams = await Team.countDocuments({});
    // const submissions = await Submission.countDocuments({});

    // const colleges = new Set((await Team.find({}, "college -_id")).map((team) => team.college.toString())).size;
    const colleges = (await User.distinct("college")).length;


    res.status(200).send({
      users,
      teams,
      // submissions,
      colleges,
    });
  } catch (err) {
    next(err);
  }
};


export const getHomepageLeaderboard = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const teams: LeaderboardRecord[] = (await Submission.aggregate([
      {
        $match: {
          status: SubmissionStatus.ADMIN_APPROVED,
        },
      },
      {
        $lookup: {
          from: "teams",
          localField: "team_id",
          foreignField: "_id",
          as: "joined_data",
        },
      },
      {
        $unwind: "$joined_data",
      },
      {
        $project: {
          _id: 0,
          name: "$joined_data.name",
          bugs: "$joined_data.bugs",
        },
      },
    ])) as unknown as LeaderboardRecord[];

    res.status(200).send({
      teams: teams.map((team) => ({
        ...team,
        score: team.bugs.length ? team.bugs[0].score : 0,
        bugs: team.bugs.length ? team.bugs[0].bug_count : 0,
      })),
    });
  } catch (err) {
    next(err);
  }


};
