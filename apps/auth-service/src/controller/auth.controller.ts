import { NextFunction, Request, Response } from "express";
import { ValidationError } from "../../../../packages/error-handler";
import prisma from "../../../../packages/libs/prisma";
import { checkotprestrictions, validateregistrationdata } from "../utils/auth.helper";


// register a new user
export  const userRegisteration = async ( req: Request, res: Response,next : NextFunction ) => {
   validateregistrationdata(req.body, "user"); 
    const { email,} = req.body;
   
const existingUser = await prisma.user.findUnique({ where: { email } });
if (existingUser) {
    return next(new ValidationError("user already exists with this email!"));
};
await checkotprestrictions(email,next);
await trackOtprequest(email,next);

}
