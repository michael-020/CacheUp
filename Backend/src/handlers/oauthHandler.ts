import { Request, Response } from "express";
import { GOOGLE_CONFIG } from "../config/oauth";
import axios from "axios";
import { userModel } from "../models/db";
import jwt from "jsonwebtoken"

export const initiateGoogleAuth = (req: Request, res: Response) => {
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  
  authUrl.searchParams.append('client_id', GOOGLE_CONFIG.client_id);
  authUrl.searchParams.append('redirect_uri', GOOGLE_CONFIG.redirect_uri);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', GOOGLE_CONFIG.scope);
  authUrl.searchParams.append('access_type', 'offline');
  authUrl.searchParams.append('prompt', 'select_account');
  
  res.redirect(authUrl.toString());
};

export const handleGoogleCallback = async (req: Request, res: Response) => {
  const { code } = req.query;

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

    // Verify email domain
    if (!email.endsWith("@pvppcoe.ac.in")) {
      return res.redirect("/signin?error=invalid_domain");
    }

    // Find or create user
    let user = await userModel.findOne({ email });

    if (!user) {
      const username = email.split("@")[0];
      
      user = await userModel.create({
        email,
        name,
        username,
        isEmailVerified: true, // Google accounts are pre-verified
        authType: 'google', // Set auth type to google
        department: "",
        graduationYear: "",
        bio: "",
        friends: [],
        friendRequests: [],
        posts: []
      });
    }

    // Set JWT cookie with proper options
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '30d' }
    );

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Redirect to frontend with success
    res.redirect("/home");

  } catch (error) {
    console.error("OAuth error:", error);
    res.redirect("/signin?error=oauth_failed");
  }
};