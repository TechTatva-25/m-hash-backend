import "dotenv/config";
declare const app: import("express-serve-static-core").Express;
declare module "express-session" {
    interface SessionData {
        userId?: string;
        username?: string;
        role?: string;
    }
}
export default app;
