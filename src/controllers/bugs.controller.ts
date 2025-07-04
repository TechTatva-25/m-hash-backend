import { NextFunction, Request , Response } from "express";
import mongoose from "mongoose";


import Bug from "../models/Leaderboard/bug";
import BugType from "../models/Leaderboard/bugtype";
import Team from "../models/Team/team";



// Create a new bug report
export const bugReport = async (req: Request, res: Response, next: NextFunction) => {
  const { category, reported_by_team_id, found_in_team_id, status, points_awarded, admin_notes } = req.body;
  try {
    // Determine points (use default if not provided)
    let points = points_awarded;
    if (points === undefined) {
      const bugType = await BugType.findOne({ name: category });
      if (!bugType) return res.status(400).json({ error: "Invalid bug category" });
      points = bugType.default_points;
    }

    // Create bug
    const bug = await Bug.create({
      category,
      reported_by_team_id,
      found_in_team_id,
      status,
      points_awarded: points,
      admin_notes,
    });

    // Update team scores
    if (status === "valid") {
      await Team.findByIdAndUpdate(
        reported_by_team_id,
        { $inc: { "bugs.0.score": points, "bugs.0.bug_count": 1 } }
      );
      await Team.findByIdAndUpdate(
        found_in_team_id,
        { $inc: { "bugs.0.score": -points, "bugs.0.bug_count": 1 } }
      );
    } else if (status === "invalid") {
      await Team.findByIdAndUpdate(
        reported_by_team_id,
        { $inc: { "bugs.0.score": -points, "bugs.0.bug_count": 1 } }
      );
    }

    res.status(201).json(bug);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};



export const editBugReport = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    
    const originalBug = await Bug.findById(id);
    if (!originalBug) return res.status(404).json({ error: "Bug not found" });

    
    const newCategory = updates.category ?? originalBug.category;
    const newStatus = updates.status ?? originalBug.status;

    
    let newPoints = updates.points_awarded;
    if (newPoints === undefined) {
      if (updates.category) {
        // If there is a change in category, points will change which needs to be fetched
        const bugType = await BugType.findOne({ name: newCategory });
        if (!bugType) return res.status(400).json({ error: "Invalid bug category" });
        newPoints = bugType.default_points;
      } else {
        newPoints = originalBug.points_awarded;
      }
    }

    // Calculate score changes
    const oldStatus = originalBug.status;
    const oldPoints = originalBug.points_awarded;
    const reportedTeamId = originalBug.reported_by_team_id;
    const foundTeamId = originalBug.found_in_team_id;

    // Undo old score effect
    if (oldStatus === "valid") {
      await Team.findByIdAndUpdate(reportedTeamId, { $inc: { "bugs.0.score": -oldPoints } });
      await Team.findByIdAndUpdate(foundTeamId, { $inc: { "bugs.0.score": oldPoints } });
    } else if (oldStatus === "invalid") {
      await Team.findByIdAndUpdate(reportedTeamId, { $inc: { "bugs.0.score": oldPoints } });
    }

    // Apply new score effect
    if (newStatus === "valid") {
      await Team.findByIdAndUpdate(reportedTeamId, { $inc: { "bugs.0.score": newPoints } });
      await Team.findByIdAndUpdate(foundTeamId, { $inc: { "bugs.0.score": -newPoints } });
    } else if (newStatus === "invalid") {
      await Team.findByIdAndUpdate(reportedTeamId, { $inc: { "bugs.0.score": -newPoints } });
    }
    // If status is "pending", no score change

    // Update the bug document
    const bug = await Bug.findByIdAndUpdate(
      id,
      {
        ...updates,
        category: newCategory,
        status: newStatus,
        points_awarded: newPoints,
      },
      { new: true }
    );

    res.json(bug);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const listBugReports = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const reports = await Bug.find();
    res.json(reports);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getBugReportById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ error: "Bug not found" });
    res.json(bug);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const createBugType = async (req: Request, res: Response, next: NextFunction) => {
  const { name, default_points } = req.body;
  try {
    const existing = await BugType.findOne({ name });
    if (existing) return res.status(400).json({ error: "Bug type already exists" });

    const bugType = await BugType.create({ name, default_points });
    res.status(201).json(bugType);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateBugType = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const updates: { name?: string; default_points?: number } = req.body;
  try {
    
    if (updates.name) {
      const existing = await BugType.findOne({ name: updates.name, _id: { $ne: id } });
      if (existing) return res.status(400).json({ error: "Bug type with this name already exists" });
    }

    const bugType = await BugType.findByIdAndUpdate(id, updates, { new: true });
    if (!bugType) return res.status(404).json({ error: "Bug type not found" });
    res.json(bugType);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};


export const listBugTypes = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const bugTypes = await BugType.find();
    res.json(bugTypes);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const editTeamPoints = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { points, reason } = req.body;
  try {
    
    const team = await Team.findByIdAndUpdate(
      id,
      { $inc: { "bugs.0.score": points } },
      { new: true }
    );
    if (!team) return res.status(404).json({ error: "Team not found" });

    // Should we have a field to mention the reason for manual change in score??

    res.json({ team, message: `Points adjusted by ${points} for reason: ${reason}` });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getLeaderboard = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // The formula for the actual point calculation needs to be discussed first 
    const teams = await Team.find().sort({ "bugs.0.score": -1 }).select("name bugs");
    res.json(teams);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};