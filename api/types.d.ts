import { SessionData as SessionDataType } from "./types/Session";

declare module "express-session" {
    interface SessionData extends SessionDataType {}
}
