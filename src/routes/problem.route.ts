import express, { RequestHandler } from "express";

import {
  createProblem,
  deleteProblem,
  getProblem,
  getProblems,
  updateProblem,
} from "@/controllers/problem.controller";
import {
  adminRequiredMiddleware,
  validationMiddleware,
} from "@/middlewares/auth.middleware";
import {
  createProblemValidator,
  deleteProblemValidator,
  getProblemValidator,
  updateProblemValidator,
} from "@/models/Problem/validator";

const router = express.Router();

router.post(
  "/create",
  adminRequiredMiddleware as RequestHandler,
  createProblemValidator,
  validationMiddleware as RequestHandler,
  createProblem as RequestHandler
);

router.get(
  "/get",
  getProblemValidator,
  validationMiddleware as RequestHandler,
  getProblem as RequestHandler
);

router.get("/list", getProblems as RequestHandler);

router.patch(
  "/update",
  adminRequiredMiddleware as RequestHandler,
  updateProblemValidator,
  validationMiddleware as RequestHandler,
  updateProblem as RequestHandler
);

router.delete(
  "/delete",
  adminRequiredMiddleware as RequestHandler,
  deleteProblemValidator,
  validationMiddleware as RequestHandler,
  deleteProblem as RequestHandler
);

export default router;
