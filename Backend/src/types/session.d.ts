import 'express-session';

declare module 'express-session' {
  interface SessionData {
    googleSignup?: {
      email: string;
      authType: 'google';
    };
  }
}