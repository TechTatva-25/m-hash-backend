import "dotenv/config";
import express, { RequestHandler } from "express";
import cors, { CorsOptions } from "cors";
import { Server } from "node:http";
import session from "express-session";
import MongoStore from "connect-mongo";
import fileUpload from "express-fileupload";

import { Logger } from "./libs/logger";
import { HttpLogger } from "./middlewares/logger.middleware";
import { NotFoundException } from "./models/exceptions";
import { connectToDatabase } from "./db";
import { initRoutes } from "./routes/router";

const app = express();
let server: Server | null = null;
const port = process.env.PORT ?? 3000;

const logger = new Logger("AppLogger");
const httpLogger = new HttpLogger(logger);

// Trust proxy so that secure cookies work on Render (or any proxy)
app.set("trust proxy", 1); // <-- 🔥 Required for "secure" cookies

// ✅ CORS config: allow cookies to flow from localhost:3000
const corsOptions: CorsOptions = {
	origin: process.env.CLIENT_URL ?? "http://localhost:3000",
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
	credentials: true, // allow session cookie to be sent
};
app.use(cors(corsOptions));

app.use(express.json());

// Extend session data to include custom fields
declare module "express-session" {
	interface SessionData {
		userId?: string;
		username?: string;
		role?: string;
	}
}

// ✅ SESSION CONFIG — 🔥 key fix: secure: true + sameSite: "none"
app.use(
	session({
		secret: process.env.SESSION_SECRET || "defaultsecret",
		resave: false,
		saveUninitialized: false,
		store: MongoStore.create({
			mongoUrl: process.env.MONGO_DB_URI || "mongodb://localhost:27017/yourdb",
		}),
		cookie: {
			maxAge: 1000 * 60 * 60, // 1 hour
			httpOnly: true,
			secure: true,           // <-- Required for HTTPS on Render
			sameSite: "none",       // <-- Required for cross-site cookies
		},
	}),
);

app.use(httpLogger.log);
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } }));

// Initialize all routes
initRoutes(app);

// Root route
app.get("/", (async (_req, res, next) => {
	try {
		res.send({ message: "Welcome to the API" });
	} catch (err) {
		next(err);
	}
}) as RequestHandler);

// Fallback 404 route
app.get("/{*path}", (async (_req, _res, next) => {
	try {
		throw new NotFoundException("Route not found");
	} catch (err) {
		next(err);
	}
}) as RequestHandler);

// Error logger
app.use(httpLogger.error);

// DB connection + start server
connectToDatabase(logger).then(() => {
	server = app.listen(port, () => {
		logger.logger.info(`App listening on port ${port}`);
	});
});

// Graceful shutdown
process.on("SIGTERM", () => {
	logger.logger.debug("SIGTERM signal received: closing HTTP server");
	if (!server) {
		logger.logger.error("HTTP server not running");
		process.exit(1);
	}
	server.close(() => {
		logger.logger.warning("HTTP server closed");
	});
});

export default app;
