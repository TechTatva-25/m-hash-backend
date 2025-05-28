import express from "express";

import authRoute from "./auth.route";

export function initRoutes(app: express.Application): void {
	app.use("/api/auth", authRoute);
}