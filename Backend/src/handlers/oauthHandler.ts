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
  try {
    const { code, state } = req.query;
    const authType = state as 'signin' | 'signup';

    const tokenResponse = await axios.post(GOOGLE_CONFIG.token_uri, {
      code,
      client_id: GOOGLE_CONFIG.client_id,
      client_secret: GOOGLE_CONFIG.client_secret,
      redirect_uri: GOOGLE_CONFIG.redirect_uri,
      grant_type: "authorization_code"
    });

    const { access_token } = tokenResponse.data;
    const userInfoResponse = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { email } = userInfoResponse.data;
    const existingUser = await userModel.findOne({ email });

    if (authType === 'signup') {
      if (existingUser) {
        return res.redirect(`${process.env.FRONTEND_URL}/verify-email?error=email_exists`);
      }

      req.session.googleSignup = {
        email,
        authType: 'google'
      };
      await req.session.save();

      return res.redirect(`${process.env.FRONTEND_URL}/set-up-account`);
    }

    // Handle signin flow
    if (authType === 'signin') {
      if (!existingUser) {
        return res.redirect(`${process.env.FRONTEND_URL}/signin?error=no_account`);
      }

      generateToken(existingUser._id, res);
      return res.redirect(`${process.env.FRONTEND_URL}/home`);
    }

  } catch (error) {
    console.error("OAuth error:", error);
    return res.redirect(`${process.env.FRONTEND_URL}/verify-email?error=oauth_failed`);
  }
};