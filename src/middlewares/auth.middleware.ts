import { envConfig } from "@/configs/index.js";
import { AuthenticationError, CustomError } from "@/errors/index.js";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { redisService } from "@/services/index.js";
import { namespaces } from "@/configs/redis.config.js";

type VerifyTokenMiddlewareOptions =
    | { type: "at"; required?: boolean }
    | { type: "rt" };
export const verifyTokenMiddleware = (
    options: VerifyTokenMiddlewareOptions
) => {
    const type = options.type;
    if (type == "at") {
        return verifyAccessToken(options.required);
    } else {
        return verifyRefreshToken();
    }
};

const verifyAccessToken = (required: boolean = true) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Get the token
        const secret = envConfig.JWT_ACCESS_SECRET;
        const authorization = req.headers.authorization;
        if (!authorization) {
            if (!required) {
                return next();
            }
            return next(
                new AuthenticationError(
                    "Missing authorization header",
                    StatusCodes.UNAUTHORIZED
                )
            );
        }
        const token = authorization.split(" ")[1];
        if (!token) {
            if (!required) {
                return next();
            }
            return next(
                new AuthenticationError(
                    "Missing access token",
                    StatusCodes.UNAUTHORIZED
                )
            );
        }
        if (
            await redisService.get({
                namespace: namespaces.JWT_Token_Blacklist,
                key: token
            })
        ) {
            if (!required) {
                return next();
            }
            return next(
                new AuthenticationError(
                    "Invalid access token",
                    StatusCodes.UNAUTHORIZED
                )
            );
        }
        // Validate the token
        try {
            if (!secret) {
                if (!required) {
                    return next();
                }
                return next(
                    new CustomError(
                        "JWT secret key is not found",
                        StatusCodes.INTERNAL_SERVER_ERROR
                    )
                );
            }
            const payload = jwt.verify(token, secret) as jwt.JwtPayload;
            req.user = payload.user;
            return next();
        } catch (err) {
            if (err instanceof jwt.JsonWebTokenError) {
                if (!required) {
                    return next();
                }
                return next(
                    new AuthenticationError(
                        "Invalid access token",
                        StatusCodes.UNAUTHORIZED
                    )
                );
            } else {
                if (!required) {
                    return next();
                }
                return next(err);
            }
        }
    };
};

const verifyRefreshToken = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Get the token
        const secret = envConfig.JWT_REFRESH_SECRET;
        const token = req.cookies.refreshToken;
        if (!token) {
            return next(
                new AuthenticationError(
                    "Missing refresh token",
                    StatusCodes.UNAUTHORIZED
                )
            );
        }
        if (
            !(await redisService.get({
                namespace: namespaces.JWT_Refresh_Token,
                key: token
            }))
        ) {
            return next(
                new AuthenticationError(
                    "Invalid refresh token",
                    StatusCodes.UNAUTHORIZED
                )
            );
        }
        // Validate the token
        try {
            if (!secret) {
                return next(
                    new CustomError(
                        "JWT secret key is not found",
                        StatusCodes.INTERNAL_SERVER_ERROR
                    )
                );
            }
            const payload = jwt.verify(token, secret) as jwt.JwtPayload;
            req.user = payload.user;
            return next();
        } catch (err) {
            if (err instanceof jwt.JsonWebTokenError) {
                return next(
                    new AuthenticationError(
                        "Invalid refresh token",
                        StatusCodes.UNAUTHORIZED
                    )
                );
            } else {
                return next(err);
            }
        }
    };
};

export const isVerifiedUserMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user!;
    if (!user.isVerified) {
        return next(
            new AuthenticationError(
                "User is not verified",
                StatusCodes.UNAUTHORIZED
            )
        );
    }
    return next();
};
