/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import {
    AuthenticationError,
    CustomError,
    ValidationError
} from "@/errors/index.js";
import { omitPropsFromObject } from "@/utils/object.js";
import { StatusCodes } from "http-status-codes";
import logger from "@/utils/logger.js";
export const errorMiddleware = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // validation error
    if (err instanceof ValidationError) {
        logger.info("Validation error: " + err.message);
        res.status(err.statusCode).json({
            status: "failed",
            error: {
                type: err.name,
                message: err.message,
                details: omitPropsFromObject(err, ["zodErrors"]).fieldErrors
            }
        });
        return;
    }
    //authentication error
    if (err instanceof AuthenticationError) {
        logger.info("Authentication error: " + err.message);
        res.status(err.statusCode).json({
            status: "failed",
            error: {
                type: err.name,
                message: err.message
            }
        });
        return;
    }
    // custom error
    if (err instanceof CustomError) {
        logger.info(err.message);
        res.status(err.statusCode).json({
            status: "failed",
            error: {
                message: err.message
            }
        });
        return;
    }
    // unexpected error
    else {
        logger.error(err.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: "failed",
            error: {
                message: err.message
            }
        });
        return;
    }
};
