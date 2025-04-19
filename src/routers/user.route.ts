import { userRouteConfig } from "@/configs/routes/index.js";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { userController } from "@/controllers/user.controller.js";
import {
    isVerifiedUserMiddleware,
    verifyTokenMiddleware
} from "@/middlewares/auth.middleware.js";
import { fieldsFileUpload, singleFileUpload } from "@/middlewares/index.js";
const router = Router();

router.get(userRouteConfig.status, (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
        message: "Auth api",
        status: "OK"
    });
});

router.post(
    userRouteConfig.uploadSong,
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
    userController.uploadSong
);

router.post(
    userRouteConfig.createAlbum,
    verifyTokenMiddleware("at"),
    singleFileUpload({
        fieldName: "coverImage",
        allowedExtensions: [".jpg", "jpeg", ".png"]
    }),
    userController.createAlbum
);

router.patch(
    userRouteConfig.setSongs,
    verifyTokenMiddleware("at"),
    userController.setSongs
);

export default router;
