import express, { RequestHandler } from "express";
import rateLimiter from "express-rate-limit";

import {
  authRequiredMiddleWare,
  validationMiddleware,
} from "../middlewares/auth.middleware";
import { registrationStoppedMiddleware } from "../middlewares/registrationStopped.middleware";
import {
  createTeamValidator,
  listTeamsValidator,
  removeMemberValidator,
} from "../models/Team/validators/validator";
import { TooManyRequestsException } from "../models/exceptions";
import {
  createSubmissionValidator,
  deleteSubmissionValidator,
} from "../models/Submission/validators/validator";
import {
  createTeam,
  deleteSubmission,
  deleteTeam,
  getProgress,
  getSubmission,
  getTeam,
  leaveTeam,
  listStages,
  listTeams,
  makeSubmission,
  removeMember,
} from "../controllers/team.controller";

const router = express.Router();

router.use(authRequiredMiddleWare as RequestHandler);

router.use(registrationStoppedMiddleware as RequestHandler);

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (_req, _res, next) => {
    next(new TooManyRequestsException("Too many requests"));
  },
});

router.post(
  "/create",
  limiter,
  createTeamValidator,
  validationMiddleware as RequestHandler,
  createTeam as RequestHandler
);

router.get("/get", getTeam as RequestHandler);

router.delete("/delete", deleteTeam as RequestHandler);

router.post("/leave", leaveTeam as RequestHandler);

router.get(
  "/list",
  listTeamsValidator,
  validationMiddleware as RequestHandler,
  listTeams as RequestHandler
);

router.post(
  "/remove-member",
  removeMemberValidator,
  validationMiddleware as RequestHandler,
  removeMember as RequestHandler
);

router.get("/get-progress", getProgress as RequestHandler);

router.get("/get-stages", listStages as RequestHandler);

router.post(
  "/make-submission",
  createSubmissionValidator,
  validationMiddleware as RequestHandler,
  makeSubmission as RequestHandler
);

router.delete(
  "/delete-submission",
  deleteSubmissionValidator,
  validationMiddleware as RequestHandler,
  deleteSubmission as RequestHandler
);

router.get("/get-submission", getSubmission as RequestHandler);

export default router;
