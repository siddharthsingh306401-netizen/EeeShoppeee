import { NextFunction } from "express";
import { validateregistrationdata } from "../utils/auth.helper";


// register a new user
export  const userRegisteration = async ( req: Request, res: Response,next : NextFunction ) => {
   validateregistrationdata(req.body, "user"); 
    const { name,email,} = req.body;
    }
}