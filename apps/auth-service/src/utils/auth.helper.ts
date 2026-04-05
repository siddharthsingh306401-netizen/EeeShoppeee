import crypto from 'crypto';
import { ValidationError } from '../../../../packages/error-handler';
import redis from '../../../../packages/libs/reddis';
import { sendEmail } from './sendMail';
import { NextFunction } from 'express';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RegistrationData = {
    name?: string;
    email?: string;
    password?: string;
    phone_number?: string;
    country?: string;
};

export const validateRegistrationData = (data: RegistrationData, usertype: "user" | "seller") => {
    const name = data.name?.trim();
    const email = data.email?.trim().toLowerCase();
    const password = data.password?.trim();
    const phone_number = data.phone_number?.trim();
    const country = data.country?.trim();
        
    if( !name || !email || !password || (usertype=== "seller" && !phone_number) || !country ) {
        throw new ValidationError(`Missing required fields`)
    }

    if( !emailRegex.test(email)) {
        throw new ValidationError(`Invalid email format!`);
    }

    };

    export const checkotprestrictions = async ( email: string, next: NextFunction) => {
        if (await redis.get(`otp_lock:${email}`) ){
            throw new ValidationError("account locked due to multiple fail event. Please try again later.");
        };
    
   if (await redis.get(`otp_spam_lock:${email}`)) {
    throw new ValidationError("too many otp request !. Please wait 1 hour before requesting a new OTP.");
   }

    if ( await redis.get(`otp_cooldown:${email}`)) {
        throw new ValidationError("OTP already sent! Please wait one minutes before requesting a new one.");
    }
}; 

export const trackOtprequest = async ( email: string, next: NextFunction) => {
    const otpRequestkey = `otp_request_count:${email}`;
    let otpRequests = parseInt((await redis.get(otpRequestkey)) || "0");
if (otpRequests>= 2) {
    await redis.set(``)
     
}



    export const sendotp = async( name :string ,email: string,template :string ) => {
        const otp = crypto.randomInt(1000, 9999).toString();
        const isEmailSent = await sendEmail(email, "verify your email ", template, { name, otp});

        if (!isEmailSent) {
            throw new ValidationError("Unable to send OTP email right now. Please try again later.");
        }

        await Promise.all([
            redis.set(`otp:${email}`,otp, "EX", 300),
            redis.set(`otp_cooldown:${email}`, "true", "EX", 60),
        ]);

        return otp;
    }
