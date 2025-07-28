import express, { RequestHandler } from "express";

import { judgeRequiredMiddleware } from "../middlewares/auth.middleware";
import {
	updateSubmissionStatus,
	RejectSubmissionStatus,
	getTeam,
	getProb,
	listTeamsWithBugRound,
	updateBugRoundScore,
	getAllApprovedTeams,
	updateTeamScore,
	getAllRounds,
	updateTeamDeployStatus,
	getAverageDenominatorConfig,
	getMyProblems,
} from "../controllers/judge.controller";
const router = express.Router();

router.use(judgeRequiredMiddleware as RequestHandler);

router.use("/approve", updateSubmissionStatus as RequestHandler);

router.post("/reject", RejectSubmissionStatus as RequestHandler);

router.post("/team", getTeam as RequestHandler);

router.post("/prob", getProb as RequestHandler);

router.get("/listTeamsWithBugRound", listTeamsWithBugRound as RequestHandler);

router.post("/updateBugRoundScore", updateBugRoundScore as RequestHandler);

router.get("/get-all-approved-teams", getAllApprovedTeams as RequestHandler);

router.post("/update-score", updateTeamScore as RequestHandler);

router.get("/get-rounds", getAllRounds as RequestHandler);

router.post(
	"/updateTeamDeployStatus",
	updateTeamDeployStatus as RequestHandler,
);

router.get(
	"/getAverageDenominatorConfig",
	getAverageDenominatorConfig as RequestHandler,
);

router.get("/get-problems", getMyProblems as RequestHandler);

export default router;
