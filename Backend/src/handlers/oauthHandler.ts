import { Request, Response } from "express";
import { GOOGLE_CONFIG } from "../config/oauth";
import axios from "axios";
import { userModel } from "../models/db";
import jwt from "jsonwebtoken";
import { generateToken } from "../lib/utils";

// Common function to initiate Google OAuth
const initiateGoogleAuth = (req: Request, res: Response, authType: 'signin' | 'signup') => {
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  
  authUrl.searchParams.append('client_id', GOOGLE_CONFIG.client_id);
  authUrl.searchParams.append('redirect_uri', GOOGLE_CONFIG.redirect_uri);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', GOOGLE_CONFIG.scope);
  authUrl.searchParams.append('access_type', 'offline');
  authUrl.searchParams.append('prompt', 'select_account');
  authUrl.searchParams.append('state', authType); // Add state to track signin/signup
  
  res.redirect(authUrl.toString());
};

export const initiateGoogleSignin = (req: Request, res: Response) => {
  initiateGoogleAuth(req, res, 'signin');
};

export const initiateGoogleSignup = (req: Request, res: Response) => {
  initiateGoogleAuth(req, res, 'signup');
};

export const handleGoogleCallback = async (req: Request, res: Response) => {
  const { code, state } = req.query;
  const authType = state as 'signin' | 'signup';

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post(GOOGLE_CONFIG.token_uri, {
      code,
      client_id: GOOGLE_CONFIG.client_id,
      client_secret: GOOGLE_CONFIG.client_secret,
      redirect_uri: GOOGLE_CONFIG.redirect_uri,
      grant_type: "authorization_code"
    });

    const { access_token } = tokenResponse.data;

    // Get user info
    const userInfoResponse = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { email, name } = userInfoResponse.data;

    // Find user
    const existingUser = await userModel.findOne({ email });

    // Handle signup
    if (authType === 'signup') {
      if (existingUser) {
        return res.redirect(`${process.env.FRONTEND_URL}/verify-email?error=email_exists`);
      }

      // Create new user
      const newUser = await userModel.create({
        email,
        name,
        isEmailVerified: true,
        authType: 'google',
        department: "",
        graduationYear: "",
        bio: "",
        friends: [],
        friendRequests: [],
        posts: [],
        isGoogleSetupComplete: false
      });

      generateToken(newUser._id, res);
      return res.redirect(`${process.env.FRONTEND_URL}/set-up-account`);
    }

    // Handle signin
    if (authType === 'signin') {
      if (!existingUser) {
        return res.redirect(`${process.env.FRONTEND_URL}/signin?error=no_account`);
      }

      generateToken(existingUser._id, res);
      return res.redirect(`${process.env.FRONTEND_URL}/home`);
    }

  } catch (error) {
    console.error("OAuth error:", error);
    const redirectPath = authType === 'signin' ? 'signin' : 'verify-email';
    return res.redirect(`${process.env.FRONTEND_URL}/${redirectPath}?error=oauth_failed`);
  }
};