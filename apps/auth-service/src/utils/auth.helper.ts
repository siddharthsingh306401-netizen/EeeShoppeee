import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { ValidationError } from "../../../../packages/error-handler";
import prisma from "../../../../packages/libs/prisma";
import redis from "../../../../packages/libs/reddis";
import { sendEmail } from "./sendMail";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RegistrationData = {
  name?: string;
  email?: string;
  password?: string;
  phone_number?: string;
  country?: string;
};

export const validateRegistrationData = (
  data: RegistrationData,
  usertype: "user" | "seller",
) => {
  const name = data.name?.trim();
  const email = data.email?.trim().toLowerCase();
  const password = data.password?.trim();
  const phone_number = data.phone_number?.trim();
  const country = data.country?.trim();

  const hasMissingCommonFields = !name || !email || !password;
  const hasMissingSellerFields =
    usertype === "seller" && (!phone_number || !country);

  if (hasMissingCommonFields || hasMissingSellerFields) {
    throw new ValidationError("Missing required fields");
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format!");
  }
};

export const checkotprestrictions = async (email: string) => {
  try {
    // Check if account is locked
    if (await redis.get(`otp_lock:${email}`)) {
      console.warn(`[OTP] Account locked for ${email}`);
      throw new ValidationError(
        "Account temporarily locked due to failed attempts. Please try again later.",
      );
    }

    // Check if spam locked (too many requests)
    if (await redis.get(`otp_spam_lock:${email}`)) {
      console.warn(`[OTP] Spam lock active for ${email}`);
      throw new ValidationError(
        "Too many OTP requests. Please wait 1 hour before requesting a new OTP.",
      );
    }

    // Check cooldown (too frequent requests)
    if (await redis.get(`otp_cooldown:${email}`)) {
      console.warn(`[OTP] Cooldown active for ${email}`);
      throw new ValidationError(
        "OTP already sent. Please wait 1 minute before requesting a new one.",
      );
    }

    console.log(`[OTP] No restrictions for ${email}`);
  } catch (error) {
    console.error(`[OTP] Error checking restrictions for ${email}:`, error);
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError("Failed to check OTP restrictions. Please try again.");
  }
};

export const trackOtprequest = async (email: string) => {
  try {
    const otpRequestkey = `otp_request_count:${email}`;
    const otpRequests = parseInt(
      (await redis.get(otpRequestkey)) || "0",
      10,
    );

    console.log(`[OTP] Request count for ${email}: ${otpRequests}`);

    // Allow maximum 2 requests per hour
    if (otpRequests >= 2) {
      console.warn(`[OTP] Spam lock triggered for ${email} after ${otpRequests} requests`);
      await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600);
      throw new ValidationError(
        "Too many OTP requests. Please wait 1 hour before requesting a new OTP.",
      );
    }

    // Track new request
    await redis.set(otpRequestkey, otpRequests + 1, "EX", 3600);
    console.log(`[OTP] Request count updated for ${email}: ${otpRequests + 1}`);
  } catch (error) {
    console.error(`[OTP] Error tracking request for ${email}:`, error);
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError("Failed to track OTP request. Please try again.");
  }
};

export const sendotp = async (
  name: string,
  email: string,
  template: string,
) => {
  try {
    const otp = crypto.randomInt(1000, 9999).toString();
    console.log(`[OTP] Generating OTP for ${email}: ${otp}`);

    const isEmailSent = await sendEmail(email, "verify your email", template, {
      name,
      otp,
    });

    if (!isEmailSent) {
      console.error(`[OTP] Failed to send email to ${email}`);
      throw new ValidationError(
        "Unable to send OTP email. Please check your email address or try again later.",
      );
    }

    console.log(`[OTP] Email sent successfully to ${email}`);

    // Store OTP in Redis for 5 minutes (300 seconds)
    await Promise.all([
      redis.set(`otp:${email}`, otp, "EX", 300),
      redis.set(`otp_cooldown:${email}`, "true", "EX", 60),
    ]);

    console.log(`[OTP] OTP stored in Redis for ${email}`);
    return otp;
  } catch (error) {
    console.error(`[OTP] Error in sendotp for ${email}:`, error);
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError("Failed to send OTP. Please try again.");
  }
};

export const verifyOtp = async (email: string, otp: string) => {
  try {
    const otpKey = `otp:${email}`;
    const failedAttemptsKey = `otp_verify_fail_count:${email}`;
    const lockedKey = `otp_lock:${email}`;

    // Check if account is locked due to failed attempts
    if (await redis.get(lockedKey)) {
      console.warn(`[OTP] Account locked for ${email} due to failed attempts`);
      throw new ValidationError(
        "Account temporarily locked due to too many failed OTP attempts. Please try again in 15 minutes.",
      );
    }

    // Check if OTP exists
    const storedOtp = await redis.get(otpKey);
    if (!storedOtp) {
      console.warn(`[OTP] OTP not found or expired for ${email}`);
      throw new ValidationError(
        "OTP expired or not found. Please request a new OTP.",
      );
    }

    // Compare OTPs
    if (storedOtp !== otp) {
      const failedAttempts = parseInt(
        (await redis.get(failedAttemptsKey)) || "0",
        10,
      );
      const nextFailedAttempts = failedAttempts + 1;

      console.warn(
        `[OTP] Invalid OTP for ${email}. Attempt ${nextFailedAttempts}`,
      );

      // Set new failed attempt count
      await redis.set(failedAttemptsKey, nextFailedAttempts, "EX", 3600);

      // Lock account after 5 failed attempts
      if (nextFailedAttempts >= 5) {
        await redis.set(lockedKey, "locked", "EX", 900); // Lock for 15 minutes
        console.error(
          `[OTP] Account locked for ${email} after 5 failed attempts`,
        );
        throw new ValidationError(
          "Too many invalid OTP attempts. Account locked for 15 minutes.",
        );
      }

      throw new ValidationError(
        `Invalid OTP. You have ${5 - nextFailedAttempts} attempts remaining.`,
      );
    }

    // OTP is valid - cleanup Redis keys
    console.log(`[OTP] OTP verified successfully for ${email}`);
    await Promise.all([
      redis.del(otpKey),
      redis.del(`otp_cooldown:${email}`),
      redis.del(failedAttemptsKey),
      redis.del(`otp_request_count:${email}`),
    ]);

    console.log(`[OTP] Cleanup completed for ${email}`);
  } catch (error) {
    console.error(`[OTP] Error in verifyOtp for ${email}:`, error);
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError("OTP verification failed. Please try again.");
  }
};
export const handleForgotPassword = async (req: Request, 
  res: Response, 
  next: NextFunction, 
  usertype: "user" | "seller") => {
  try{
    const email = String(req.body.email ?? "").trim().toLowerCase();

    if (!email) {
      throw new ValidationError("Email is required.");
    }

    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format!");
    }

    // find the user in db
    const user = usertype === "user"
      ? await prisma.user.findUnique({ where: { email } })
      : await prisma.sellers.findUnique({ where: { email } });

    if (!user) {
      throw new ValidationError(`${usertype} not found!`);
    }

    // check otp restrict
    await checkotprestrictions(email);
    await trackOtprequest(email); 
    // generate opt and send email
    await sendotp(user.name,email, usertype === "user" ? "forgot-password-user-mail" : "forgot-password-seller-mail");
    return res.status(200).json({
      message: "OTP sent to your email please verify your account.",
    });
  }
  catch (error){
    return next(error);
  }
};



export const verifyForgotPasswordOtp = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const otp = String(req.body.otp ?? "").trim();

    if (!email || !otp) {
      throw new ValidationError("Email and OTP are required.");
    }

    await verifyOtp(email, otp);
    return res.status(200).json({
      message: "OTP verified successfully! You can now reset your password.",
    });
  } catch(error){ 
    return next(error);  
  }
};
