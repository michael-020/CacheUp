export const GOOGLE_CONFIG = {
  client_id: process.env.GOOGLE_CLIENT_ID!,
  client_secret: process.env.GOOGLE_CLIENT_SECRET!,
  redirect_uri: `${process.env.BACKEND_URL}/auth/google/callback`,
  auth_uri: "https://accounts.google.com/o/oauth2/v2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  scope: [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email"
  ].join(" ")
};