import { envConfig } from "@/configs/index.js";
import { AuthenticationError, CustomError } from "@/errors/index.js";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { redisService } from "@/services/index.js";
import { namespaces } from "@/configs/redis.config.js";

export const verifyTokenMiddleware = (type: "at" | "rt") => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const secret =
            type == "at"
                ? envConfig.JWT_ACCESS_SECRET
                : envConfig.JWT_REFRESH_SECRET;
        let token: string;
        if (type == "at") {
            const authorization = req.headers.authorization;
            if (!authorization) {
                return next(
                    new AuthenticationError(
                        "Missing authorization header",
                        StatusCodes.UNAUTHORIZED
                    )
                );
            }
            token = authorization.split(" ")[1];
            if (!token) {
                return next(
                    new AuthenticationError(
                        "Missing access token",
                        StatusCodes.UNAUTHORIZED
                    )
                );
            }
        } else {
            token = req.cookies.refreshToken;
            if (!token) {
                return next(
                    new AuthenticationError(
                        "Missing refresh token",
                        StatusCodes.UNAUTHORIZED
                    )
                );
            }
        }
        if (
            await redisService.get({
                namespace: namespaces.JWT_Token_Blacklist,
                key: token
            })
        ) {
            return next(
                new AuthenticationError(
                    "Invalid token",
                    StatusCodes.UNAUTHORIZED
                )
            );
        }
        if (type == "rt") {
            if (
                !(await redisService.get({
                    namespace: namespaces.JWT_Refresh_Token,
                    key: token
                }))
            ) {
                return next(
                    new AuthenticationError(
                        "Invalid token",
                        StatusCodes.UNAUTHORIZED
                    )
                );
            }
        }
        try {
            if (!secret) {
                throw new CustomError(
                    "JWT secret key is not found",
                    StatusCodes.INTERNAL_SERVER_ERROR
                );
            }
            const payload = jwt.verify(token, secret) as jwt.JwtPayload;
            req.user = payload.user;
            return next();
        } catch (err) {
            if (err instanceof jwt.JsonWebTokenError) {
                return next(
                    new AuthenticationError(
                        "Invalid token",
                        StatusCodes.UNAUTHORIZED
                    )
                );
            } else {
                return next(err);
            }
        }
    };
};
