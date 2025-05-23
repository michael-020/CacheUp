import { Router } from "express";
import viewProfileHanler from "../handlers/viewProfileHandler";
import friendHandler from "../handlers/friendHandler";
import userBioHanler from "../handlers/userBioHandler";
import PfpHanler from "../handlers/profilePicHandler";
import { signupHandler } from "../handlers/signupHandler";
import { loginHandler } from "../handlers/loginHandler";
import viewBioHandler from "../handlers/viewBioHandlers";
import { initiateSignUpHandler } from "../handlers/initiateSignupHandler";
import { verifyOtpHandler } from "../handlers/verifyOTPHandler";
import { authMiddleware } from "../middlewares/auth";
import { checkAuth } from "../handlers/checkAuthHandler";
import { logOutHandler } from "../handlers/logOutHandler";
import { editProfileHandler } from "../handlers/editProfileHandler";
import { getTokenHandler } from "../handlers/getTokenHandler";
import { getUsernameHandler } from "../handlers/getUsernameHandler";
import { 
    sendPasswordResetOTP, 
    verifyPasswordResetOTP, 
    resetPassword 
  } from "../handlers/changePasswordHandler";
import { deleteAccountHandler } from "../handlers/deleteAccountHandler";
import { logPageViewHandler } from '../handlers/timeTrackingHandler';
import { setupGoogleAccountHandler, checkSetupSession } from "../handlers/setupGoogleAccountHandler";

const userRouter: Router = Router();

userRouter.post("/send-password-reset-otp", sendPasswordResetOTP);
userRouter.post("/verify-password-reset-otp", verifyPasswordResetOTP);
userRouter.post("/reset-password", resetPassword);

// signup
// step 1: initiate signup
userRouter.post("/initiate-signup", initiateSignUpHandler)

// step 2: verify otp
userRouter.post("/verify-otp", verifyOtpHandler)

// step 3: complete signup
userRouter.post("/complete-signup", signupHandler)

// signin
userRouter.post("/signin", loginHandler)

// Google account setup routes
userRouter.get("/check-setup-session", checkSetupSession);
userRouter.post("/setup-google-account", setupGoogleAccountHandler);

// get endpoints for non-authenticated users: 
userRouter.use("/profile", viewProfileHanler)

userRouter.use(authMiddleware)

// check auth of user
userRouter.get("/check", checkAuth)

// logout
userRouter.post("/logout", logOutHandler)

// edit profile 
userRouter.put("/editProfile", editProfileHandler)

// view own profile
userRouter.use("/viewProfile", viewProfileHanler)

userRouter.get("/usernames", getUsernameHandler)

// friends
userRouter.use("/friends", friendHandler)

// user Bio
userRouter.use("/bio", userBioHanler)

// view Bio
userRouter.use("/viewBio", viewBioHandler)

// PFP
userRouter.use("/profilePicture", PfpHanler)

// get token
userRouter.get("/get-token", getTokenHandler)

// delete account
userRouter.delete("/delete-account", deleteAccountHandler)

userRouter.post('/log-page-view', logPageViewHandler);

export default userRouter;