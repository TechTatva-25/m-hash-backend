import { NextFunction, Request, Response } from "express";

import College from "../models/College/college";

export const getColleges = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const colleges = (await College.find()).map((college) => ({
      _id: college._id,
      name: college.name,
    }));

    res.status(200).json(colleges);
  } catch (error) {
    next(error);
  }
};

export const getCollegesWithState = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const colleges = await College.find();

    res.status(200).json(colleges);
  } catch (error) {
    next(error);
  }
};

export const getCollege = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { college_id } = req.query as Record<string, string>;
    const college = await College.findById(college_id);

    if (!college) {
      res.status(404).json({ message: "College not found" });
    }

    res.status(200).json(college);
  } catch (error) {
    next(error);
  }
};
