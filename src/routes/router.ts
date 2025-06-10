import express from "express";

import authRoute from "./auth.route";
import judgeRoute from "./judge.route";
import adminRoute from "./admin.route";
import teamRoute from "./team.route";
import inviteRoute from "./invite.route";
import problemRoute from "./problem.route";
import collegeRoute from "./college.route";

export function initRoutes(app: express.Application): void {
  app.use("/api/auth", authRoute);
  app.use("/api/judge", judgeRoute);
  app.use("/api/admin", adminRoute);
  app.use("/api/team", teamRoute);
  app.use("/api/invite", inviteRoute);
  app.use("/api/problem", problemRoute);
  app.use("/api/college", collegeRoute);
}
