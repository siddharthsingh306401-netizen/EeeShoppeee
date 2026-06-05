import { NextFunction, Request, Response } from "express";
import { ValidationError, AuthError } from "../../../../packages/error-handler";
import prisma from "../../../../packages/libs/prisma";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import {
  checkotprestrictions,
  handleForgotPassword,
  sendotp,
  trackOtprequest,
  validateRegistrationData,
  verifyForgotPasswordOtp,
  verifyOtp,
} from "../utils/auth.helper";
import { setCookie } from "../utils/cookies/setCookie";
import Stripe from "stripe";




const stripe =  new Stripe (process.env.STRIPE_SECRET_KEY !, {
  apiVersion: "2022-11-15",
}
);

// register a new user - send OTP to email
export const userRegisteration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const name = String(req.body.name ?? "").trim();

    // Validate inputs
    if (!email || !name) {
      throw new ValidationError("Email and name are required.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format!");
    }

    // Check if user already registered (completed verification)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ValidationError("User already registered with this email. Please login.");
    }

    // Check OTP restrictions before sending
    await checkotprestrictions(email);
    await trackOtprequest(email);
    
    // Send OTP to email
    await sendotp(name, email, "user-activation-mail");

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify within 5 minutes.",
    });
  } catch (error) {
    return next(error);
  }
};
// verify OTP and create user account
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Extract and normalize inputs
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const otp = String(req.body.otp ?? "").trim();
    const password = String(req.body.password ?? "").trim();
    const name = String(req.body.name ?? "").trim();

    // Validate all required fields
    if (!email || !otp || !password || !name) {
      throw new ValidationError(
        "Email, OTP, password, and name are required.",
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format.");
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      throw new ValidationError(
        "Password must be at least 6 characters long.",
      );
    }

    // Check if user already exists (should not happen if code works correctly)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ValidationError(
        "User already registered. Please login or use forgot password.",
      );
    }

    // Verify OTP - this will throw if OTP is invalid or expired
    await verifyOtp(email, otp);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    await prisma.user.create({
      data: { email, name, password: hashedPassword },
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully! You can now login.",
      email,
    });
  } catch (error) {
    return next(error);
  }
};
// login user with email and password
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Extract and normalize inputs
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const password = String(req.body.password ?? "").trim();

    // Validate inputs
    if (!email || !password) {
      throw new ValidationError("Email and password are required.");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format.");
    }

    console.log(`[LOGIN] Login attempt for ${email}`);

    // Find user in database
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.warn(`[LOGIN] User not found: ${email}`);
      throw new AuthError("Invalid email or password.");
    }

    if (!user.password) {
      console.error(`[LOGIN] User has no password set: ${email}`);
      throw new AuthError("Account configuration error. Please contact support.");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.warn(`[LOGIN] Invalid password for ${email}`);
      throw new AuthError("Invalid email or password.");
    }

    console.log(`[LOGIN] Password verified for ${email}`);

    // Generate access token (short-lived)
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: "user" },
      process.env.ACCESS_TOKEN_SECRET || "access-secret-key-change-in-production",
      { expiresIn: "15m" },
    );

    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email, role: "user" },
      process.env.REFRESH_TOKEN_SECRET || "refresh-secret-key-change-in-production",
      { expiresIn: "7d" },
    );

    console.log(`[LOGIN] Tokens generated for ${email}`);

    // Set tokens in httpOnly cookies
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log(`[LOGIN] Login successful for ${email}`);

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    console.error("[LOGIN] Login error:", error);
    return next(error);
  }
};

//refresh token user
export const refreshToken = async (req: Request, res: Response, next : NextFunction) => {

try{
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) {
    return new ValidationError("unauthorized! No refresh token .");
  }
  const decoded = jwt.verify(
    refreshToken, 
    process.env.REFRESH_TOKEN_SECRET as string, 
  ) as { id: string ; role:string};
  if(!decoded ||  !decoded.id ||  !decoded.role){
    return  new JsonWebTokenError('Forbidden! Invalid refresh token.');
  }
  //let account;
  //if(decoded.role === "user"){
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) {
    return  new AuthError("Forbidden! User/Seller not found.");

}
 const newAccessToken = jwt.sign(
  { id: decoded.id,role: decoded.role },
  process.env.JWT_SECRET as string,
  { expiresIn: "15m" },
 );

 setCookie(res,"access_token", newAccessToken);
 return res.status(201).json({success:true});

}catch(error){
  return next(error);
}


};
// get logged in user 

export const  getUser = async (req:Request,res:Response,next:NextFunction) => { 
  try{
    const user = req.user;
    res.status(201).json({
      success:true,
      user,
    });
  }catch(error){
    next(error);
  }
};
   // user forgot password
export const userForgotPassword = async(req: Request, res: Response, next: NextFunction) => {
  await handleForgotPassword(req, res, next, "user");
};
// verify forgot password OTP
export const verifyUserForgotPassword = async(req: Request, res: Response, next: NextFunction) => { 
  await verifyForgotPasswordOtp(req, res, next);
};

            
//reset user password
export const resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const { email,newPassword } = req.body;
    if(!email || !newPassword){
      return next(new ValidationError("Email and new password are required."));
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if(!user) return next(new ValidationError("User not found!"));

    //compare new password with the existing password
    if (user.password) {
      const isSamePassword = await bcrypt.compare(newPassword, user.password); 
      if(isSamePassword){
        return next(new ValidationError("New password cannot be the same as the old password!"));
      }
    }

  //hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  //update the password in the database
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });
  res.status(200).json({
    message: "Password reset successful! You can now login with your new password.",
  });

}catch(error){
    next(error);
}
};

// register a new seller
export const registerSeller = async (req: Request, res: Response, next: NextFunction) => {
  try{
    validateRegistrationData(req.body,"seller");
    const { name,email  } = req.body;
  const existingSeller = await prisma.sellers.findUnique({ where: { email } });
  if(existingSeller){
    return next(new ValidationError("Seller already registered with this email. Please login."));
  } 
  await checkotprestrictions(email);
  await trackOtprequest(email);
  await sendotp(name, email, "seller-activation-mail");
  res.status(200).json({
    success: true,
    message: "OTP sent to your email.please verify your account.",
  });
  }


  catch(error){
    next(error);
  } 
};

// verify seller with OTP
export const verifySeller = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const {email,otp,password,name,phone_number,country } = req.body;
    if (!email || !otp || !password || !name || !phone_number || !country) {
      return next(new ValidationError("All fields are required."));
  }
  const existingSeller = await prisma.sellers.findUnique({ 
    where: { email },
   }); 
   if (existingSeller) 
    return next(new ValidationError("Seller already registered with this email."));
   await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);

    const Seller = await prisma.sellers.create({
      data: {
        email,
        name,
        password: hashedPassword,
        phone_number,
        country,
      },
    });
    res.status(201)
       .json({ Seller, message: "Seller registered successfully!" });      
  }catch(error){
      next(error);
  }
};
// create a new shop

export const createShop = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const {name,bio,address,opening_hours,website,category,sellerId} = req.body;

    if(!name || !bio || !address || !opening_hours || !website || !category || !sellerId){
      return next(new ValidationError("All fields are required."));
    }
    const shopData : any= {
      name,
      bio,
      address,
      opening_hours,
      category,
      sellerId,
    };
    if(website && website.trim()!==""){
      shopData.website = website;
    }
    const shop = await prisma.shops.create({
      data: shopData,
    });}catch(error){
      next(error);
  }
};  
   
   
    //create stripe connect account link
    export const createStripeConnectLink = async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const { sellerId } = req.body;
        if (!sellerId) {
          return next(new ValidationError("Seller ID is required."));
        }
      const seller = await prisma.sellers.findUnique({ 
        where: { 
          id: sellerId

         }
         });
    if(!seller){
      return next(new ValidationError("Seller not found!"));
    }
    const account = await stripe.accounts.create({
      type: "express",
      email: seller?.email,
      country: "GB",
      capabilities:{
        card_payments:{requested:true},
        transfers:{requested:true},
      },
    });
    await prisma.sellers.update({
      where:{id: sellerId},
      data:{
        stripeId : account.id,
      },
    });
     
  const accountLink = await stripe.accountLinks.create({ 
  account: account.id,
  refresh_url: `https//localhost:3000/success`,
  return_url: `https://localhost:3000/success`,
  type: "account_onboarding",}
  );
  res.json({ url: accountLink.url });  

  }
  catch(error){
    next(error);
  }
};

// login seller
export const loginSeller = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const {email,password} = req.body;
    if(!email || !password){
      return next(new ValidationError("Email and password are required."));
    
      const seller = await prisma.sellers.findUnique({ where: { email } });
      if(!seller || !seller.password){
        return next(new ValidationError("Invalid email or password."));
      
  //verify password
      const isMatch = await bcrypt.compare(password, seller.password);
      if(!isMatch){
        return next(new ValidationError("Invalid email or password."));
      

      //generate access token and refresh token
        const accessToken = jwt.sign(
          {id: seller.id, role: "seller"},
          process.env.ACCESS_TOKEN_SECRET as string,
          {expiresIn: "15m"}
        );
        const refreshToken = jwt.sign(
          {id: seller.id, role: "seller"},
          process.env.REFRESH_TOKEN_SECRET as string,
          {expiresIn: "7d"}
        );
        //store refresh  token and access token 
        setCookies(res,"seller-refrersh-token", refreshToken); 
        setCookies(res,"seller-access-token", accessToken);
        res.status(200).json({
          message: "Login successful!",
          seller: { id :seller.id,email: seller.email, name: seller.name },
        });         

      
      }
      catch(error){
        next(error);
      }
    };
  } 


      
