import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';

// type CustomRequest = Request & {
//     userId? : string
// }

export function authMiddleware(req : CustomRequest, res : Response , next : NextFunction){
    const token = req.headers['authorization'] ?? "";
    const decoded = jwt.verify(token , process.env.JWT_SECRET as string) as JwtPayload;
    if (decoded && decoded.userId){
        req.userId = decoded.userId;
        next();
    }
    else{
        res.status(403).json({
            message : 'Unauthorized'
        })
    }
}
