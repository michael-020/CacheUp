import { Request, Response } from "express";
import { z } from "zod";
import { otpModel, userModel } from "../models/db";
import { generateOTP, sendOTP } from "../emailService";

export const initiateSignUpHandler = async (req: Request, res: Response) => {
  
  const mySchema = z.object({email: z.string().email()}).strict();

  
  const validationResult = mySchema.safeParse(req.body);

  if (!validationResult.success) {
    res.status(403).json({
      msg: "Incorrect Format",
      error: validationResult.error.errors,
    });
    return;
  }

  const { email } = validationResult.data;

  try {
    
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      res.status(403).json({ msg: "Email Already Exists" });
      return;
    }
    
    const otp = generateOTP();
    await otpModel.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    const emailSent = await sendOTP(email, otp);
    if (!emailSent) {
      res.status(500).json({ msg: "Failed to send OTP. Please try again." });
      return;
    }
    
    res.json({
      msg: "OTP sent to your email. Please verify to continue registration.",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "An error occurred. Please try again." });
  }
};

  