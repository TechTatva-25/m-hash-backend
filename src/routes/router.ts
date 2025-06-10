import express from "express";

import authRoute from "./auth.route";
import judgeRoute from "./judge.route";
import adminRoute from "./admin.route"

export function initRoutes(app: express.Application): void {
	app.use("/api/auth", authRoute);
	app.use("/api/judge",judgeRoute);
	app.use("/api/admin",adminRoute);
}
