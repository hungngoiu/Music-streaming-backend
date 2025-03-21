import { userRouteConfig } from "@/configs/routes/index.js";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { userController } from "@/controllers/user.controller.js";
import {
    isVerifiedUserMiddleware,
    verifyTokenMiddleware
} from "@/middlewares/auth.middleware.js";
import { fieldsFileUpload } from "@/middlewares/file.middleware.js";
const router = Router();

router.get(userRouteConfig.status, (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
        message: "Auth api",
        status: "OK"
    });
});

router.post(
    userRouteConfig.upload,
    verifyTokenMiddleware("at"),
    fieldsFileUpload({
        fields: [
            {
                name: "audioFile",
                maxCount: 1,
                allowedExtensions: [".mp3", ".wav"]
            },
            {
                name: "coverImage",
                maxCount: 1,
                allowedExtensions: [".jpg", ".jpeg", ".png"]
            }
        ]
    }),
    isVerifiedUserMiddleware,
    userController.upload
);

export default router;
