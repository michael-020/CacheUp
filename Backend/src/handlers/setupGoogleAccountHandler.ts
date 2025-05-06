import { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { userModel } from "../models/db";

const setupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
    .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
    .regex(/[0-9]/, "Password must contain at least 1 number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 special character"),
  confirmPassword: z.string(),
  profilePicture: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const setupGoogleAccountHandler = async (req: Request, res: Response) => {
  try {
    const response = setupSchema.safeParse(req.body);
    if (!response.success) {
      res.status(400).json({
        message: "Invalid input",
        errors: response.error.errors,
      });
      return
    }

    const { username, password, profilePicture } = response.data;

    // Check if username already exists
    const existingUser = await userModel.findOne({ username });
    if (existingUser) {
      res.status(400).json({
        message: "Username already taken",
      });
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user
    await userModel.findByIdAndUpdate(req.user._id, {
      username,
      password: hashedPassword,
      profilePicture: profilePicture || undefined,
      isGoogleSetupComplete: true,
    });

    res.status(200).json({
      message: "Account setup complete",
    });
  } catch (error) {
    console.error("Error in setup:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};