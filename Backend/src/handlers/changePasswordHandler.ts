import { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { IUser, userModel } from "../models/db";
import { otpModel } from "../models/db";
import { generateOTP, sendOTP } from "../emailService";


export const sendPasswordResetOTP = async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({
    email: z.string().email(),
  }).strict();

  const validation = schema.safeParse(req.body);
  if (!validation.success) {
     res.status(400).json({
      msg: "Invalid input",
      error: validation.error.errors
    });
    return
  }

  const { email } = validation.data;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
       res.status(404).json({ msg: "User not found with this email" });
       return
    }

    const otp = generateOTP();
    
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await otpModel.findOneAndDelete({ email });

    await otpModel.create({
      email,
      otp,
      expiresAt
    });

    const emailSent = await sendOTP(email, otp);
    if (!emailSent) {
       res.status(500).json({ msg: "Failed to send OTP email" });
       return
    }

     res.status(200).json({ msg: "OTP sent to your email" });
     return
  } catch (error) {
    console.error("Error sending password reset OTP:", error);
     res.status(500).json({ msg: "An error occurred. Please try again." });
     return
  }
};

export const verifyPasswordResetOTP = async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({
    email: z.string().email(),
    otp: z.string().length(6, "OTP must be 6 digits")
  }).strict();

  const validation = schema.safeParse(req.body);
  if (!validation.success) {
     res.status(400).json({
      msg: "Invalid input",
      error: validation.error.errors
    });
    return
  }

  const { email, otp } = validation.data;

  try {
    const otpRecord = await otpModel.findOne({ email });
    if (!otpRecord || otpRecord.otp !== otp) {
       res.status(400).json({ msg: "Invalid OTP" });
       return
    }

    const now = new Date();
    if (now > otpRecord.expiresAt) {
      await otpModel.deleteOne({ email });
       res.status(400).json({ msg: "OTP has expired. Please request a new one." });
       return
    }

     res.status(200).json({ msg: "OTP verified successfully" });
     return
  } catch (error) {
    console.error("Error verifying password reset OTP:", error);
     res.status(500).json({ msg: "An error occurred. Please try again." });
     return
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({
    email: z.string().email(),
    otp: z.string().length(6, "OTP must be 6 digits"),
    newPassword: z.string().min(8, "Password must be at least 8 characters long")
  }).strict();

  const validation = schema.safeParse(req.body);
  if (!validation.success) {
     res.status(400).json({
      msg: "Invalid input",
      error: validation.error.errors
    });
    return
  }

  const { email, otp, newPassword } = validation.data;

  try {
    const otpRecord = await otpModel.findOne({ email });
    if (!otpRecord || otpRecord.otp !== otp) {
       res.status(400).json({ msg: "Invalid OTP" });
       return
    }

    const now = new Date();
    if (now > otpRecord.expiresAt) {
      await otpModel.deleteOne({ email });
       res.status(400).json({ msg: "OTP expired" });
       return
    }

    const user = await userModel.findOne({ email });
    if (!user) {
       res.status(404).json({ msg: "User not found" });
       return
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    user.password = hashedPassword;
    await user.save();

    await otpModel.deleteOne({ email });

     res.status(200).json({ msg: "Password updated successfully" });
     return
  } catch (error) {
    console.error("Password reset error:", error);
     res.status(500).json({ msg: "Internal server error" });
     return
  }
};