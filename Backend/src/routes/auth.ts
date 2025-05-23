import { Router } from "express";
import { initiateGoogleSignin, initiateGoogleSignup, handleGoogleCallback } from "../handlers/oauthHandler";

const authRouter = Router();

authRouter.get("/google/signin", initiateGoogleSignin);
authRouter.get("/google/signup", initiateGoogleSignup);
authRouter.get("/google/callback", handleGoogleCallback);

export default authRouter;