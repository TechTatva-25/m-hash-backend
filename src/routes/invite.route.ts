import express, { RequestHandler } from "express";
import rateLimiter from "express-rate-limit";

import { TooManyRequestsException } from "@/models/exceptions";
import {
  inviteUserValidator,
  inviteValidator,
  sendJoinRequestValidator,
} from "@/models/Invite/validator";
import {
  authRequiredMiddleWare,
  validationMiddleware,
} from "@/middlewares/auth.middleware";
import { registrationStoppedMiddleware } from "@/middlewares/registrationStopped.middleware";
import {
  acceptInvite,
  acceptJoinRequest,
  cancelInvite,
  cancelJoinRequest,
  getInvites,
  getTeamInvites,
  inviteUser,
  rejectInvite,
  rejectJoinRequest,
  sendJoinRequest,
} from "@/controllers/invite.controller";

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
  "/invite-user",
  limiter,
  inviteUserValidator,
  validationMiddleware as RequestHandler,
  inviteUser as RequestHandler
);

router.post(
  "/cancel-invite",
  inviteValidator,
  validationMiddleware as RequestHandler,
  cancelInvite as RequestHandler
);

router.post(
  "/send-join-request",
  limiter,
  sendJoinRequestValidator,
  validationMiddleware as RequestHandler,
  sendJoinRequest as RequestHandler
);

router.post(
  "/cancel-join-request",
  inviteValidator,
  validationMiddleware as RequestHandler,
  cancelJoinRequest as RequestHandler
);

router.post(
  "/accept-invite",
  inviteValidator,
  validationMiddleware as RequestHandler,
  acceptInvite as RequestHandler
);

router.post(
  "/reject-invite",
  inviteValidator,
  validationMiddleware as RequestHandler,
  rejectInvite as RequestHandler
);

router.post(
  "/accept-join-request",
  inviteValidator,
  validationMiddleware as RequestHandler,
  acceptJoinRequest as RequestHandler
);

router.post(
  "/reject-join-request",
  inviteValidator,
  validationMiddleware as RequestHandler,
  rejectJoinRequest as RequestHandler
);

router.get("/list-invites", getInvites as RequestHandler);

router.get("/my-team-invites", getTeamInvites as RequestHandler);

export default router;
