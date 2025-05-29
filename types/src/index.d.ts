import "express-session";
import * as session from "express-session";

declare module "express-session" {
  interface SessionData {
    userId: string;
    username: string;
    role: string;
  }
}

declare module "express-serve-static-core" {
  interface Request {
    session: session.Session & Partial<session.SessionData>;
    sessionStore: session.Store;
  }
}
