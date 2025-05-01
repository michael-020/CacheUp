import { Router } from "express";
import { handleGoogleCallback, initiateGoogleAuth } from "../handlers/oauthHandler";

const authRouter = Router();

authRouter.get("/google", initiateGoogleAuth);
authRouter.get("/google/callback", handleGoogleCallback);

export default authRouter;