
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational : boolean;
    public readonly details? : any;

    constructor(message: string, statusCode: number, isOperational = true, details?: any) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;
        
        Error.captureStackTrace(this);
    }

}

//Not found error
export class NotFoundError extends AppError {
    constructor(message = 'Resources  not found') {
        super(message, 404);
    }
}
// validation error( use for joi/zod/react-hook-form validation errors)
export class ValidationError extends AppError {
    constructor(message = 'invalid request data ', details?: any) {
        super(message, 400, true, details);
}
} 

// authentication error
export class AuthError extends AppError {
    constructor(message = "unauthorizes") {
        super(message, 401);
    }
}

// forbidden error( for insufficient permissions)
export class ForbiddenError extends AppError {  
    constructor(message = "forbidden") {
        super(message, 403);
    }
}
// Database error
export class DatabaseError extends AppError {
    constructor(message = "database error", details?: any) {
        super(message, 500, true, details);
    }
}

// RATE LIMIT ERROR
export class RateLimitError extends AppError {
    constructor(message = "too many requests, please try again later") {
        super(message, 429);
    }
}   