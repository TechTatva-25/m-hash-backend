import express, { RequestHandler } from "express";
import rateLimiter from "express-rate-limit";

import {
  adminRequiredMiddleware,
  validationMiddleware,
} from "../middlewares/auth.middleware";
import { TooManyRequestsException } from "../models/exceptions";
import {
  sendTeamMail,
  AdmingetProgress,
  makeJudge,
  //deleteTeam,
  //getAllSubmissions,
  adminApprove,
  adminReject,
  getAdminStats,
  getAllJudges,
  assignProblem,
  deassignProblem,
  getTeamJudgeMapping  
} from "../controllers/admin.controller";
import { getTeam, getProb } from "../controllers/judge.controller";

import { getProgressValidator } from "../models/Stage/validators/validator";
import { makeJudgeValidator } from "../models/User/Validators/Validators";

const router = express.Router();

router.use(adminRequiredMiddleware as RequestHandler);

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (_req, _res, next) => {
    next(new TooManyRequestsException("Too many requests"));
  },
});

router.post("/send-team-mail", limiter, sendTeamMail as RequestHandler);

router.post(
  "/get-team-prog",
  validationMiddleware as RequestHandler,
  getProgressValidator,
  AdmingetProgress as RequestHandler
);

router.post(
  "/make-judge",
  makeJudgeValidator,
  validationMiddleware as RequestHandler,
  makeJudge as RequestHandler
);

//router.post("/delete-team", deleteTeam as RequestHandler);

//router.get("/submissions", getAllSubmissions as RequestHandler);

router.post("/admin-approve", adminApprove as RequestHandler);

router.post("/admin-reject", adminReject as RequestHandler);

router.post("/team", getTeam as RequestHandler);

router.post("/prob", getProb as RequestHandler);

router.get("/stats", getAdminStats as RequestHandler);

router.get("/judges", getAllJudges as RequestHandler);

router.post("/assign-problem", assignProblem as RequestHandler);

router.post("/de-assign-problem", deassignProblem as RequestHandler);

router.get("/getTeamJudgeMapping", getTeamJudgeMapping as RequestHandler);



export default router;
