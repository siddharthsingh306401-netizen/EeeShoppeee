import { NextFunction, Request, Response } from "express";
import { ValidationError } from "../../../../packages/error-handler";
import prisma from "../../../../packages/libs/prisma";
import {
  checkotprestrictions,
  sendotp,
  trackOtprequest,
  validateRegistrationData,
} from "../utils/auth.helper";

// register a new user
export const userRegisteration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateRegistrationData(req.body, "user");

    const email = req.body.email.trim().toLowerCase();
    const name = req.body.name.trim();

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ValidationError("user already exists with this email!");
    }

    await checkotprestrictions(email);
    await trackOtprequest(email);
    await sendotp(name, email, "user-activation-mail");

    res.status(200).json({
      message: "OTP sent to email. Please verify your account.",
    });
  } catch (error) {
    return next(error);
  }
};
