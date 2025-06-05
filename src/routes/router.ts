import express from "express";

import authRoute from "./auth.route";
import judgeRoute from "./auth.route";

export function initRoutes(app: express.Application): void {
	app.use("/api/auth", authRoute);
	app.use("/api/judge",judgeRoute);
}