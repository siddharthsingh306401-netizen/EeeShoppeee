import crypto from 'crypto';
import { ValidationError } from '../../../../packages/error-handler';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const validateregistrationdata = (DataView: any, usertype: "user "| "seller") {
    const{
        name,email,password,phone_number,country}= data;
        
    if( !name || !email || !password || (usertype=== "seller" && !phone_number) || !country ) {
        throw new ValidationError(`Missing required fields`)
    }

    if( !emailRegex.test(email)) {
        throw new ValidationError(`Invalid email format!`);
    }

    };