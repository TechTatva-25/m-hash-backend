import {
  createBugValidator,
  updateBugValidator,
  createBugTypeValidator,
  updateBugTypeValidator,
  editTeamPointsValidator,
} from "../models/Leaderboard/validators/validator";

import { adminRequiredMiddleware } from "../middlewares/auth.middleware";
import express, { RequestHandler } from "express";

import {
  bugReport,
  editBugReport,
  listBugReports,
  getBugReportById,
  createBugType,
  updateBugType,
  listBugTypes,
  editTeamPoints,
  getLeaderboard,
} from "../controllers/bugs.controller";

const router = express.Router();

router.post(
  "/report",
  adminRequiredMiddleware as RequestHandler,
  createBugValidator,
  bugReport as RequestHandler
);

router.patch(
  "/edit-report/:id",
  adminRequiredMiddleware as RequestHandler,
  updateBugValidator,
  editBugReport as RequestHandler
);

// GET /api/bugs/list - List all bugs (Admin only)
router.get(
  "/list-bug-reports",
  adminRequiredMiddleware as RequestHandler,
  listBugReports as RequestHandler
);

router.get(
  "/get-single-bug-report/:id",
  adminRequiredMiddleware as RequestHandler,
  getBugReportById as RequestHandler
);

router.post(
  "/add-bug-type",
  adminRequiredMiddleware as RequestHandler,
  createBugTypeValidator,
  createBugType as RequestHandler
);

router.patch(
  "/edit-bug-type/:id",
  adminRequiredMiddleware as RequestHandler,
  updateBugTypeValidator,
  updateBugType as RequestHandler
);

router.get(
  "/list-bug-types",
  adminRequiredMiddleware as RequestHandler,
  listBugTypes as RequestHandler
);

router.post(
  "/edit/:id/points",
  adminRequiredMiddleware as RequestHandler,
  editTeamPointsValidator,
  editTeamPoints as RequestHandler
);

router.get(
  "/leaderboard",
  // authMiddleware as RequestHandler, // All teams should be able to see the real time rankings
  // but to be on the safr side for us we can make it as admin only... then we need the admin middeware
  getLeaderboard as RequestHandler
);
export default router;
